/** Fetch all rows (PostgREST default cap is 1000 per request) */
export async function fetchAllRows(buildQuery, pageSize = 1000) {
  let from = 0;
  const all = [];

  while (true) {
    const { data, error } = await buildQuery(from, from + pageSize - 1);
    if (error) {
      return { data: all, error };
    }
    if (!data?.length) {
      break;
    }
    all.push(...data);
    if (data.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  return { data: all, error: null };
}
