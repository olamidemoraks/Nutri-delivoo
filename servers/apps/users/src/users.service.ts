import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ActivationDTO, LoginDto, RegisterDto } from './dto/user.dto'
import { PrismaService } from '../../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import * as bcrypt from 'bcrypt'
import { EmailService } from './email/email.service'
import { TokenSender } from './utils/sendToken'
import { LoginResponse } from './types/user.type'

interface UserData {
	name: string
	email: string
	password: string
	phone_number: number
}

@Injectable()
export class UsersService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService,
		private readonly emailService: EmailService,
	) {}

	async register(registerDto: RegisterDto, response: Response) {
		const { name, email, password, phone_number } = registerDto

		const isEmailExist = await this.prisma.user.findFirst({
			where: {
				email,
			},
		})

		if (isEmailExist) {
			throw new BadRequestException('User already exist with this email')
		}

		const isPhoneNumberExist = await this.prisma.user.findFirst({
			where: {
				phone_number,
			},
		})

		if (isPhoneNumberExist) {
			throw new BadRequestException('User already exist with this phone number')
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const user = {
			name,
			email,
			password: hashedPassword,
			phone_number,
		}

		const activationToken = await this.creaateActivationToken(user)

		const activationCode = activationToken.activationCode

		await this.emailService.sendMail({
			activationCode,
			email,
			subject: 'Activate your account',
			template: './activation-mail',
			name,
		})

		return { token: activationToken.token }
	}

	async creaateActivationToken(user: UserData) {
		const activationCode = Math.floor(1000 + Math.random() * 9000).toString()
		const token = this.jwtService.sign(
			{ user, activationCode },
			{ secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '5m' },
		)
		return { token, activationCode }
	}

	async activateUser(activationDTO: ActivationDTO, response: Response) {
		const { activationCode, activationToken } = activationDTO
		const newUser: { user: UserData; activationCode: string } = this.jwtService.verify(
			activationToken,
			{
				secret: this.configService.get('JWT_SECRET'),
			},
		)

		if (newUser.activationCode !== activationCode) {
			throw new BadRequestException('Invalid activation code')
		}

		const { name, email, password, phone_number } = newUser.user

		const existUser = await this.prisma.user.findUnique({
			where: { email },
		})

		if (existUser) throw new BadRequestException('User already exist with this email')

		const user = await this.prisma.user.create({
			data: {
				name,
				email,
				password,
				phone_number,
			},
		})

		return { user, response }
	}

	async login(loginDto: LoginDto): Promise<LoginResponse> {
		const { email, password } = loginDto
		const user = await this.prisma.user.findUnique({
			where: {
				email,
			},
		})

		if (user && (await this.comparePassword(password, user.password))) {
			const tokenSender = new TokenSender(this.configService, this.jwtService)
			return tokenSender.sendToken(user)
		} else {
			return {
				user: null,
				accessToken: null,
				refreshToken: null,
				error: {
					message: 'Invalid email or password',
				},
			}
		}
	}

	async comparePassword(password: string, hashPassword: string): Promise<Boolean> {
		return await bcrypt.compare(password, hashPassword)
	}

	async getLogginUser(req: any) {
		const user = req.user
		const accessToken = req.accesstoken
		const refreshToken = req.refreshtoken

		console.log({ user, accessToken, refreshToken })
		return { user, accessToken, refreshToken }
	}

	async getUsers() {
		return this.prisma.user.findMany({})
	}

	async logout(req: any) {
		req.user = null
		req.refreshtoken = null
		req.accesstoken = null
		return { message: 'logged out successful' }
	}
}
