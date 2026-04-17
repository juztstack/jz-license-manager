import { LicenseService } from './application/use-cases/LicenseService';
import { UserService } from './application/use-cases/UserService';
import { ProductService } from './application/use-cases/ProductService';
import { BundleService } from './application/use-cases/BundleService';
import { ClientService } from './application/use-cases/ClientService';
import { IDBLicenseRepository } from './infrastructure/repositories/IDBLicenseRepository';
import { IDBUserRepository } from './infrastructure/repositories/IDBUserRepository';
import { IDBProductRepository } from './infrastructure/repositories/IDBProductRepository';
import { IDBBundleRepository } from './infrastructure/repositories/IDBBundleRepository';
import { IDBClientRepository } from './infrastructure/repositories/IDBClientRepository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const services: Record<string, any> = {
  license: new LicenseService(new IDBLicenseRepository()),
  user: new UserService(new IDBUserRepository()),
  product: new ProductService(new IDBProductRepository()),
  bundle: new BundleService(new IDBBundleRepository()),
  client: new ClientService(new IDBClientRepository()),
};

declare global {
  interface Window {
    services: typeof services;
  }
}

window.services = services;
