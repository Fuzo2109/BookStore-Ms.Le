/** F5: header search – a plain GET form so it works without JavaScript. */
export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/books" method="get" role="search" className="flex w-full">
      <label htmlFor="site-search" className="sr-only">
        Search by title or author
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        maxLength={100}
        defaultValue={defaultValue}
        placeholder="Search by title or author"
        className="input rounded-r-none"
      />
      <button type="submit" className="btn-accent rounded-l-none px-5">
        Search
      </button>
    </form>
  );
}
