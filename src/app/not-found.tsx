export default function NotFound() {
  return (
    <div className="relative w-full max-w-screen-2xl block">
      <div className="flex gap-2 mx-auto my-44 justify-center">
        <h1 className="font-bold text-6xl">404</h1>
        <div className="flex flex-col justify-between">
          <h6 className="font-bold text-2xl">Not Found</h6>
          <p className="text-sm text-default-500">Page not found</p>
        </div>
      </div>
    </div>
  );
}
