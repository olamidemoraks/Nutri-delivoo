import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UsersService } from './users.service'
import {
	ActivationResponse,
	LoginResponse,
	LogoutResponse,
	RegisterReponse,
} from './types/user.type'
import { ActivationDTO, LoginDto, RegisterDto } from './dto/user.dto'
import { Request, Response } from 'express'
import { BadRequestException, UseGuards } from '@nestjs/common'
import { User } from './entities/user.entity'
import { AuthGuard } from './guards/auth.guard'

@Resolver('User')
export class UsersResolver {
	constructor(private readonly userService: UsersService) {}

	@Mutation(() => RegisterReponse)
	async register(
		@Args('registerInput') registerDto: RegisterDto,
		@Context() context: { res: Response },
	): Promise<RegisterReponse> {
		if (!registerDto.name || !registerDto.email || !registerDto.password) {
			throw new BadRequestException('Please fill all field')
		}
		return await this.userService.register(registerDto, context.res)
	}

	@Mutation(() => ActivationResponse)
	async activateUser(
		@Args('activationInput') activationDTO: ActivationDTO,
		@Context() Context: { res: Response },
	): Promise<ActivationResponse> {
		return await this.userService.activateUser(activationDTO, Context.res)
	}

	@Mutation(() => LoginResponse)
	async login(
		@Args('loginInput') loginDto: LoginDto,
		@Context() context: { res: Response },
	): Promise<LoginResponse> {
		return await this.userService.login(loginDto)
	}

	@Query(() => LoginResponse)
	@UseGuards(AuthGuard)
	async getLogginUser(@Context() context: { req: Request }) {
		const user = await this.userService.getLogginUser(context.req)
		return user
	}

	@Query(() => LogoutResponse)
	@UseGuards(AuthGuard)
	async LogoutUser(@Context() context: { req: Request }) {
		const user = await this.userService.logout(context.req)
		return user
	}

	@Query(() => [User])
	async getUser() {
		const user = await this.userService.getUsers()
		return user
	}
}
