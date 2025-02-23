import { cyan, gray, green, yellow } from 'chalk';
import { readdirSync } from 'fs';
import { join } from 'path';

export class SetupLogger {
  static logServerStart(port: number) {
    const apiPath = join(__dirname, '../api');
    const versions = readdirSync(apiPath).filter(
      (file) => readdirSync(join(apiPath, file)).length > 0,
    );

    const serverUrl = `http://localhost:${port}`;

    console.log('\n');
    console.log(cyan('🚀 Server is running!'));
    console.log(cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    // Server URL
    console.log(yellow('📡 Server URL:'));
    console.log(`   ${green(serverUrl)}`);

    // API Versions
    console.log(yellow('\n🔗 API Endpoints:'));
    versions.forEach((version) => {
      console.log(
        `   ${green(`${serverUrl}/api/${version}`)} ${gray('(API base URL)')}`,
      );
    });

    // Swagger URLs
    console.log(yellow('\n📚 API Documentation:'));
    console.log(
      `   ${green(`${serverUrl}/docs`)} ${gray('(Documentation Home)')}`,
    );
    versions.forEach((version) => {
      console.log(
        `   ${green(`${serverUrl}/docs/${version}`)} ${gray(`(${version.toUpperCase()} Documentation)`)}`,
      );
    });

    console.log(cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(`\n${gray('Press CTRL-C to stop')}\n`);
  }
}
