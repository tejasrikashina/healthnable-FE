export interface PaginationOptions{
    pageIndex:number,
    pageSize:number,
    tableName:string|undefined
  }

 export interface PageInformation {
//  totalCount: number,
//     pageSize: number,
//     currentPage: number
    total_items: number,
    limit: number,
    page: number
  }