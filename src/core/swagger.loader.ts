import { INestApplication, Type } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export class SwaggerLoader {
  static async setupSwagger(app: INestApplication): Promise<void> {
    const apiPath = join(__dirname, '../api');
    const versions = readdirSync(apiPath);

    for (const version of versions) {
      const versionPath = join(apiPath, version);
      if (!statSync(versionPath).isDirectory()) {
        continue;
      }

      // Load all modules for this version
      const modules = await this.getVersionModules(versionPath);

      const config = new DocumentBuilder()
        .setTitle(`API ${version.toUpperCase()}`)
        .setDescription(`API Documentation for version ${version}`)
        .setVersion(version)
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config, {
        include: modules,
        deepScanRoutes: true,
      });

      SwaggerModule.setup(`docs/${version}`, app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          displayOperationId: true,
          docExpansion: 'list',
          filter: true,
          showCommonExtensions: true,
          tagsSorter: 'alpha',
        },
        customCss: this.getCustomCss(),
        customJs: this.getCustomJs(),
      });
    }

    // Create index page for API documentation
    this.createDocsIndexPage(app, versions);
  }

  private static async getVersionModules(
    versionPath: string,
  ): Promise<Type<any>[]> {
    const features = readdirSync(versionPath);
    const modules: Type<any>[] = [];

    for (const feature of features) {
      const featurePath = join(versionPath, feature);
      if (!statSync(featurePath).isDirectory()) {
        continue;
      }

      try {
        const modulePath = join(featurePath, `${feature}.module`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { default: Module } = await import(modulePath);
        if (Module) {
          modules.push(Module);
        }
      } catch (error) {
        console.warn(
          `Could not load swagger for module at ${featurePath}`,
          error,
        );
      }
    }

    return modules;
  }

  private static createDocsIndexPage(
    app: INestApplication,
    versions: string[],
  ): void {
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>API Documentation</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 {
                color: #333;
                border-bottom: 2px solid #eee;
                padding-bottom: 10px;
              }
              .version-list {
                list-style: none;
                padding: 0;
              }
              .version-list li {
                margin: 10px 0;
              }
              .version-link {
                display: block;
                padding: 15px;
                background: #f8f9fa;
                color: #333;
                text-decoration: none;
                border-radius: 4px;
                transition: background-color 0.2s;
              }
              .version-link:hover {
                background: #e9ecef;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>API Documentation</h1>
              <ul class="version-list">
                ${versions
                  .map(
                    (version) => `
                  <li>
                    <a class="version-link" href="/docs/${version}">
                      ${version.toUpperCase()} Documentation
                    </a>
                  </li>
                `,
                  )
                  .join('')}
              </ul>
            </div>
          </body>
        </html>
      `;

    app.use('/docs', (_, res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      res.send(html);
    });
  }

  private static getCustomCss(): string {
    return `
        .swagger-ui .topbar { display: none }
        .swagger-ui .scheme-container { background: none }
        .swagger-ui section.models { display: none }
      `;
  }

  private static getCustomJs(): string {
    return `
        window.onload = () => {
          const mutationObserver = new MutationObserver(() => {
            const logo = document.getElementsByClassName('link')[0];
            if (logo) {
              logo.innerHTML = 'API Documentation';
              mutationObserver.disconnect();
            }
          });
          
          mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
      `;
  }
}
