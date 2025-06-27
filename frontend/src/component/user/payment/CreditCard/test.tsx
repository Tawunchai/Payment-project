

const Test = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 space-y-10">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-sm text-gray-500">ร้านค้าของคุณ</div>
          <div className="text-xs text-gray-400">Secured by Omise</div>
        </div>

        {/* Form */}
        <form className="space-y-7">
          <input
            type="text"
            placeholder="Card number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="Name on card"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="MM/YY"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="Security code"
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            defaultValue="Thailand"
          >
            <option>Thailand</option>
            <option>Singapore</option>
            <option>Malaysia</option>
          </select>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-md text-sm"
          >
            Pay 100.00 THB
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-2">
          Secured by <span className="font-semibold text-gray-500">OMISE</span>
        </div>
      </div>
    </div>
  );
};

export default Test;
