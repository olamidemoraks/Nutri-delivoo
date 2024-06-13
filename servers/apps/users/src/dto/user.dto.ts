import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

@InputType()
export class RegisterDto {
	@Field()
	@IsNotEmpty({ message: 'name is required.' })
	@IsString({ message: 'Name must need to be one string' })
	name: string

	@Field()
	@IsNotEmpty({ message: 'Email is required.' })
	@IsEmail({}, { message: 'Email is not valid' })
	email: string

	@Field()
	@IsNotEmpty({ message: 'Password is required' })
	@MinLength(8, { message: 'Password must be atleast 8 character' })
	password: string

	@Field()
	@IsNotEmpty({ message: 'Phone number is required' })
	phone_number: number
}

@InputType()
export class ActivationDTO {
	@Field()
	@IsNotEmpty({ message: 'Activation code is required.' })
	activationCode: string

	@Field()
	@IsNotEmpty({ message: 'Activation Token is required.' })
	activationToken: string
}

@InputType()
export class LoginDto {
	@Field()
	@IsNotEmpty({ message: 'Email is required.' })
	@IsEmail({}, { message: 'Email is not valid' })
	email: string

	@Field()
	@IsNotEmpty({ message: 'Password is required' })
	@MinLength(8, { message: 'Password must be atleast 8 character' })
	password: string
}
