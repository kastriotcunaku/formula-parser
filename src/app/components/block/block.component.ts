import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { stringify } from '@angular/core/src/util';
import { Block } from '../../models/block.interface';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.css']
})
export class BlockComponent implements OnInit {
  @Input() block: Block;
  @Output() blockChange = new EventEmitter();
  @Output() varChange = new EventEmitter();
  
  change(newValue) {
    this.block = newValue;
    this.blockChange.emit(newValue);
  }

  active = false;

  constructor() { }

  ngOnInit() {

  }
  
  addBlock(type: string) {
    var block = {
      type: type,
      left: this.block,
      right: {
        type: 'NUMBER',
        value: null
      }
    }

    this.block = block;
    this.change(block);
  }

  deleteBlock(): void {
    this.block = null;
    this.change(this.block);
  }
  

  childBlockChanged(model: any, index?: number, side?: 'left'|'right'): void {
    // If block has left and right side and one of them is missing, overwrite with the other one
    if(this.block && typeof this.block.left !== 'undefined' && typeof this.block.right !== 'undefined') {
      if(!this.block.left) {
        this.block = this.block.right;
        this.change(this.block);
      } else if (!this.block.right) {
        this.block = this.block.left;
        this.change(this.block);
      }
    }

    // If block is inside parentheses and inside is only one element, overwrite this block with that element
    if(this.block.type === 'PAREN') {
      if(this.block.expression && ['VARIABLE', 'NUMBER'].indexOf(this.block.expression.type) !== -1) {
        this.block = this.block.expression;
        this.change(this.block);
      }
    }

    // If an argument is deleted and this block does not have any other argument, remove this block
    if(index >= 0) {
      if(this.block.arguments && !this.block.arguments.some(a => a !== null)) {
        this.block = null;
        this.change(this.block);
      }
    }
  }

  onVarChange(name: string, value: any) {
    this.varChange.emit({ name: name, value: value });
  }
}
