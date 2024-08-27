export const compareDate =
  <TEntity>(selector: (entity: TEntity) => Date) =>
  (a: TEntity, b: TEntity) =>
    selector(b).getTime() - selector(a).getTime();
