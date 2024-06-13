import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../../prisma/prisma.service'
import { UsersResolver } from './user.resolver'
import { EmailModule } from './email/email.module'
import { EmailService } from './email/email.service'

@Module({
	imports: [
		GraphQLModule.forRoot<ApolloFederationDriverConfig>({
			driver: ApolloFederationDriver,
			autoSchemaFile: {
				federation: 2,
			},
		}),
		EmailModule,
	],
	controllers: [],
	providers: [UsersService, ConfigService, JwtService, PrismaService, UsersResolver, EmailService],
})
export class UsersModule {}
