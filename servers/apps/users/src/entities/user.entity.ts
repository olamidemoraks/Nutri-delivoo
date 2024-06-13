import { Field, Directive, ObjectType } from '@nestjs/graphql'

@ObjectType()
@Directive('@key(fields:"id")')
export class Avatars {
	@Field()
	id: string
	@Field()
	public_id: string
	@Field()
	url: string
	@Field()
	userId: string
}

@ObjectType()
export class User {
	@Field()
	id: string

	@Field()
	name: string

	@Field()
	email: string

	@Field()
	password: string

	@Field(() => Avatars, { nullable: true })
	avatar?: Avatars | null

	@Field()
	role: string

	@Field()
	phone_number: number

	@Field()
	createdAt: Date

	@Field()
	address: Date

	@Field()
	updatedAt: Date
}
