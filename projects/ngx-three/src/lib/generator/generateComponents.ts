import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';
import { NgxThreeClass } from './NgxThreeClass';
import { NgxThreeModuleGen } from './NgxThreeModuleGen';
import * as prettier from 'prettier';
import { ImportOrganizer } from './ImportOrganizer';
import { NgxThreeObject } from './NgxThreeObject';
import { Type } from '@angular/core';
import { NgxThreeMaterial } from './NgxThreeMaterial';
import { NgxThreeBufferGeometry, NgxThreeGeometry } from './NgxThreeGeometry';
import { NgxThreeControl } from './NgxThreeControl';
import { NgxThreeBarrelGen } from './NgxThreeBarrelGen';

class NgxThreeClassGenerator {
  public readonly baseOutPath = join(__dirname, '../generated');
  public readonly ngxThreeClassMap = new Map<string, NgxThreeClass>();
  private typeChecker?: ts.TypeChecker;

  constructor() {}

  generateObjects() {
    this.generate('NgxThreeObjects', NgxThreeObject);
  }

  generateMaterials() {
    this.generate('NgxThreeMaterials', NgxThreeMaterial);
  }

  generateGeometries() {
    this.generate('NgxThreeGeometries', NgxThreeGeometry);
    this.generate('NgxThreeBufferGeometries', NgxThreeBufferGeometry);
  }

  generateControls() {
    this.generate('NgxThreeControls', NgxThreeControl);
  }

  protected generate(
    exportTypeName: string,
    generatorType: Type<NgxThreeClass>
  ) {
    const threeTypes = this.getInterfacePropertyNames(exportTypeName);
    threeTypes.forEach((type) => {
      const cls = this.generateNgxThreeClass(type, generatorType);
      this.ngxThreeClassMap.set(cls.className, cls);
      this.writeFile(cls.className, cls.content);
    });

    // this.generateNgxModule(Array.from(this.ngxThreeClassMap.keys()));
  }

  private generateNgxThreeClass(
    classSymbol: ts.Symbol,
    generatorType: Type<NgxThreeClass>
  ): NgxThreeClass {
    const ngxClass = new generatorType(classSymbol, this.typeChecker);
    ngxClass.generate();

    return ngxClass;
  }

  public generateNgxModule(classNames: string[]) {
    const ngxModule = new NgxThreeModuleGen();
    ngxModule.generate(classNames);

    this.writeFile('ngx-three-generated.module', ngxModule.content);
  }

  public generateNgxBarrelFile(classNames: string[]) {
    const ngxBarrel = new NgxThreeBarrelGen();
    ngxBarrel.generate(classNames);

    this.writeFile('index', ngxBarrel.content);
  }

  private writeFile(fileName: string, content: string) {
    try {
      const organizer = new ImportOrganizer();
      content = organizer.organizeImports(
        this.baseOutPath + fileName + '.ts',
        content
      );
      content = prettier.format(content, {
        parser: 'babel-ts',
        singleQuote: true,
      });
    } catch (e) {
      console.log(e);
    }
    writeFileSync(join(this.baseOutPath, fileName + '.ts'), content);
  }

  private getInterfacePropertyNames(interfaceName: string) {
    const componentsRecordPath = join(__dirname, 'three_types.ts');
    const configFile = ts.findConfigFile(
      __dirname,
      ts.sys.fileExists,
      'tsconfig.generate.json'
    );
    if (!configFile) {
      throw new Error("can't find tsconfig.lib.json");
    }

    const { config, error } = ts.parseConfigFileTextToJson(
      configFile,
      readFileSync(configFile, { encoding: 'utf-8' })
    );
    if (error) {
      console.error(error);
      process.exit(1);
    }

    const { options } = ts.convertCompilerOptionsFromJson(
      config.compilerOptions,
      '..'
    );
    const program = ts.createProgram([componentsRecordPath], {
      ...options,
      baseUrl: '..',
    });

    const sourceFile = program.getSourceFile(componentsRecordPath);
    if (!sourceFile) {
      throw new Error("can't find three_types.ts");
    }

    const typeChecker = program.getTypeChecker();
    this.typeChecker = typeChecker;

    const visit = <T extends unknown>(
      node: ts.Node,
      f: (n: ts.Node) => T[]
    ): T[] => {
      const results = f(node);
      node.forEachChild((child) => {
        results.push(...visit(child, f));
      });

      return results.filter(Boolean);
    };

    return visit(sourceFile, (node) => {
      if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
        const declaration = node as ts.InterfaceDeclaration;

        if (declaration.name.escapedText === interfaceName) {
          console.log(
            typeChecker
              .getTypeAtLocation(declaration)
              .getProperties()
              .map((symbol) => symbol.escapedName)
          );
          const type = typeChecker.getTypeAtLocation(declaration);
          return type.getProperties();
          //   .map((symbol) => symbol.escapedName);
        }
      }
      return [];
    }); // as string[];
  }
}

// ---------------------------------------------------

const generator = new NgxThreeClassGenerator();

generator.generateObjects();
generator.generateMaterials();
generator.generateGeometries();
generator.generateControls();
generator.generateNgxModule(Array.from(generator.ngxThreeClassMap.keys()));
generator.generateNgxBarrelFile(Array.from(generator.ngxThreeClassMap.keys()));
