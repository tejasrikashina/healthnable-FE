export class PaginationModel {
    length!:number;
    pageSize:number = 5;
    pageSizeOptions: number[] = [5, 10, 25, 50];
  }