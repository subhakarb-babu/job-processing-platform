import 'dotenv/config';
import { DataSource } from 'typeorm';
import config from './configuration';

const appConfig = config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.user,
  password: appConfig.database.password,
  database: appConfig.database.name,

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],

  synchronize: false,
});