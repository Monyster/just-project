import { DynamicModule, Type } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

interface ModuleType extends Type<any> {
  register?(): Promise<DynamicModule> | DynamicModule;
}

interface ImportedModule {
  default: ModuleType;
}

export class ModuleLoader {
  static async load(): Promise<DynamicModule[]> {
    const apiPath = join(__dirname, '../api');
    const versions = readdirSync(apiPath);
    const modules: DynamicModule[] = [];

    for (const version of versions) {
      const versionPath = join(apiPath, version);
      const features = readdirSync(versionPath);

      const featureModules: ModuleType[] = [];
      const routes: Routes = [];

      for (const feature of features) {
        // Skip if it's not a directory
        if (!statSync(join(versionPath, feature)).isDirectory()) {
          continue;
        }

        const modulePath: string = join(
          versionPath,
          feature,
          `${feature}.module`,
        );

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const importedModule: ImportedModule = await import(modulePath);

          const Module = importedModule.default;

          if (Module) {
            featureModules.push(Module);
            routes.push({
              path: feature,
              module: Module,
            });
          }
        } catch (error) {
          console.warn(`Could not load module at ${modulePath}`, error);
        }
      }

      // Create version-specific module
      const VersionModule = class DynamicVersionModule {};
      const versionModule: DynamicModule = {
        module: VersionModule,
        imports: [
          ...featureModules,
          RouterModule.register([
            {
              path: `api/${version}`,
              children: routes,
            },
          ]),
        ],
      };

      modules.push(versionModule);
    }

    return modules;
  }
}
