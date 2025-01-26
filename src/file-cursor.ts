export class FileCursor {
  index = 0;

  constructor(public file: string) {}

  peek(offset = 0) {
    return this.file[this.index + offset];
  }

  next() {
    return this.file[this.index++];
  }

  nextSlice(length: number) {
    const slice = this.file.slice(this.index, this.index + length);
    this.index += length;
    return slice;
  }

  skip(skip = 1) {
    this.index += skip;
  }

  doesMatch(value: string, cursor = this.index) {
    return this.file.slice(cursor, cursor + value.length) === value;
  }

  match(value: string) {
    const result = this.doesMatch(value);
    if (result) {
      this.index += value.length;
    }

    return result;
  }

  hasNext() {
    return this.index < this.file.length;
  }
}
