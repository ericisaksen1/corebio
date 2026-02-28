export function GuaranteeSection() {
  return (
    <section className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left — Guarantee content */}
        <div className="order-2 flex items-center justify-center px-8 py-12 sm:px-12 lg:order-1 lg:px-16 lg:py-20">
          <div className="w-full max-w-[800px]">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            The Core BioRegen Guarantee
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            We don&apos;t compromise on quality. Every product meets the highest
            standards.
          </p>

          <div className="mt-10 space-y-0 divide-y divide-gray-100">
            {/* 99% Purity */}
            <div className="flex items-center gap-5 py-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <svg
                  className="h-7 w-7 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  99% Purity Guaranteed
                </h3>
                <p className="text-sm text-gray-500">Or your money back</p>
              </div>
            </div>

            {/* CoA with Every Batch */}
            <div className="flex items-center gap-5 py-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <svg
                  className="h-7 w-7 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.47 4.406a2.25 2.25 0 01-2.133 1.544H8.603a2.25 2.25 0 01-2.134-1.544L5 14.5m14 0H5"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  CoA with Every Batch
                </h3>
                <p className="text-sm text-gray-500">
                  Third party tested in America
                </p>
              </div>
            </div>

            {/* Shipment Protection */}
            <div className="flex items-center gap-5 py-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <svg
                  className="h-7 w-7 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.75m11.25 0h2.625c.621 0 1.125-.504 1.125-1.125v-4.875c0-.621-.504-1.125-1.125-1.125h-1.5m0 0l-2.25-3h-3.75m5.25 3v3.375M14.25 5.25v3.75m0 0h3.75m-3.75 0L18 5.25"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Shipment Protection
                </h3>
                <p className="text-sm text-gray-500">
                  Every order fully covered
                </p>
              </div>
            </div>

            {/* Flexible Payment Options */}
            <div className="flex items-center gap-5 py-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <svg
                  className="h-7 w-7 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Flexible Payment Options
                </h3>
                <p className="text-sm text-gray-500">
                  CashApp, Venmo or Bitcoin
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Right — Product images */}
        <div
          className="relative order-1 min-h-[300px] bg-cover bg-center lg:order-2 lg:min-h-[500px]"
          style={{ backgroundImage: "url('/uploads/3b04414b-f0be-4f5b-8780-21def7636aae.webp')" }}
          role="img"
          aria-label="Core BioRegen Products"
        />
      </div>
    </section>
  )
}
