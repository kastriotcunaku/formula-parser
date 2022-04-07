import { Component } from '@angular/core';
import { Block } from './models/block.interface.js';

import * as Parser from './parser/formula-parser.js';
const parse = Parser.parse;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  formula: string = "($b + SQRT (SQR($b) - 4 * $a)) / (2 * $a)";
  visualizerOutput: string;
  syntaxTree: Block;
  jsonView = false;
  // syntaxTreeJson: string;

  get syntaxTreeJson(): string {
    if(!this.syntaxTree) {
      return null;
    }

    return JSON.stringify(this.syntaxTree, null, 2);
  }

  updateAstView() {
    console.log('creating ast view...');
    try {
      this.syntaxTree = parse(this.formula);
      console.log('The ast is: ', this.syntaxTree);
    } catch(e) {
      alert('Invalid formula! AST parsing failed.')
    }
    // this.syntaxTreeJson = JSON.stringify(this.syntaxTree, null, 2);
  }

  convertAstToFormula() {
    if(!this.syntaxTree) {
      alert('No AST provided');
      return;
    }

    console.log('converting ast to string...');
    this.visualizerOutput = this.blockToString(this.syntaxTree);
    console.log(this.visualizerOutput);
  }

  onVarChange(data: { name: string, value: any }): void {
    this.syncVarValue(this.syntaxTree, data.name, data.value);
  }

  addBlock(type: string) {
    if(!this.syntaxTree) {
      alert('No AST provided');
      return;
    }

    var block = {
      type: type,
      left: this.syntaxTree,
      right: {
        type: 'NUMBER',
        value: null
      }
    }

    this.syntaxTree = block;
  }

  executeFormula() {
    try {
      if(!this.syntaxTree) {
        throw new Error('No AST provided');
      }

      const jitFunction = this.blockToFunction(this.syntaxTree);

      console.log(jitFunction)
      const result = eval(jitFunction);
      alert(`${jitFunction} = ${result}`);
    } catch(e) {
      alert(e.message);
    }
    
  }

  private blockToFunction(block: any) {
    if (!block) {
      return '';
    }

    switch (block.type) {
      case 'PAREN':
        return `(${this.blockToFunction(block.expression)})`;
      case 'ADDITION':
        return `${this.blockToFunction(block.left)} + ${this.blockToFunction(block.right)}`;
      case 'SUBTRACTION':
        return `${this.blockToFunction(block.left)} - ${this.blockToFunction(block.right)}`;
      case 'MULTIPLICATION':
        return `${this.blockToFunction(block.left)} * ${this.blockToFunction(block.right)}`;
      case 'DIVISION':
        return `${this.blockToFunction(block.left)} / ${this.blockToFunction(block.right)}`;
      case 'FUNCTION':
        switch(block.name) {
          case 'SQRT':
          case 'SQR':
            return `Math.sqrt(${block.arguments.map(a => this.blockToFunction(a))})`;
          case 'EXP':
            return `Math.exp(${block.arguments.map(a => this.blockToFunction(a))})`;
          case 'ABS':
            return `Math.abs(${block.arguments.map(a => this.blockToFunction(a))})`;
          case 'ROUND':
            return `Math.round(${block.arguments.map(a => this.blockToFunction(a))})`;
          case 'COS':
            return `Math.cos(${block.arguments.map(a => this.blockToFunction(a))})`;
          case 'SIN':
            return `Math.sin(${block.arguments.map(a => this.blockToFunction(a))})`;
          case 'TAN':
            return `Math.tan(${block.arguments.map(a => this.blockToFunction(a))})`;
          case 'TRUNC':
            return `Math.trunc(${block.arguments.map(a => this.blockToFunction(a))})`;
          default:
            return '';
        }
      case 'NUMBER':
        return `${block.value}`;
      case 'VARIABLE':
        if(!block.value) {
          throw new Error(`Please provide value for variable ${block.name}`);
        }
        return `${block.value}`;
      case 'PI':
        return `Math.PI`;
      default:
        return '';
    }
  }



  private blockToString(block: Block): string {
    if (!block) {
      return '';
    }

    switch (block.type) {
      case 'PAREN':
        return `(${this.blockToString(block.expression)})`;
      case 'ADDITION':
        return `${this.blockToString(block.left)} + ${this.blockToString(block.right)}`;
      case 'SUBTRACTION':
        return `${this.blockToString(block.left)} - ${this.blockToString(block.right)}`;
      case 'MULTIPLICATION':
        return `${this.blockToString(block.left)} * ${this.blockToString(block.right)}`;
      case 'DIVISION':
        return `${this.blockToString(block.left)} / ${this.blockToString(block.right)}`;
      case 'FUNCTION':
        return `${block.name}(${block.arguments.map(a => this.blockToString(a))})`;
      case 'NUMBER':
        return `${block.value}`;
      case 'VARIABLE':
        return `${block.value || block.name}`;
      case 'PI':
        return `PI`;
      default:
        return '';
    }
  }

  private syncVarValue(block: Block, name: string, value: any): Block {
    if(!block) {
      return block;  
    }

    switch(block.type) {
      case 'VARIABLE':
        if(block.name === name) {
          block.value = value;
        };
        break;
      case 'PAREN':
        block.expression = this.syncVarValue(block.expression, name, value);
        break;
      case 'ADDITION':
      case 'SUBTRACTION':
      case 'MULTIPLICATION':
      case 'DIVISION':
        block.left = this.syncVarValue(block.left, name, value);
        block.right = this.syncVarValue(block.right, name, value);
        break;
      case 'FUNCTION':
        block.arguments = block.arguments.map(a => this.syncVarValue(a, name, value));
        break;
    }
    return block;
  }
}
