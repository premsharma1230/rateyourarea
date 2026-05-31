export function getPaginationRange(currentPage, totalPages, siblingCount = 1) {
  if (totalPages <= 1) return [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const range = [];
  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  range.push(1);

  if (showLeftEllipsis) {
    range.push("ellipsis");
  } else {
    for (let page = 2; page < leftSibling; page += 1) {
      range.push(page);
    }
  }

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    if (page !== 1 && page !== totalPages) {
      range.push(page);
    }
  }

  if (showRightEllipsis) {
    range.push("ellipsis");
  } else {
    for (let page = rightSibling + 1; page < totalPages; page += 1) {
      range.push(page);
    }
  }

  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
}
