import React from 'react'

const ApplicationsGrid = ({applications}) => {
  return (
      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-6">
      {/* replace this with dynamic data fetched from the backend */}
      {applications.map((app, index) => (
        <div
          key={index}
          className="relative bg-base-100 rounded-2xl p-6 
            transform transition-all duration-300 ease-in-out
            hover:scale-105 hover:shadow-xl
            group cursor-pointer
            min-w-[200px] overflow-hidden"
        >
          {/* Content Container */}
          <div className="flex flex-col items-center space-y-4 relative z-10">
            {/* icon */}
            <div className="p-3 rounded-xl bg-gray-50 shadow-sm">
              <img
                src={app.icon}
                alt={app.name}
                className="w-12 h-12 object-contain"
              />
            </div>

            {/*app name*/}
            <div className="relative">
              <span className="text-lg font-semibold text-gray-800 
                group-hover:text-base-100 transition-colors duration-300
                relative z-10"
              >
                {app.name}
              </span>
              {/* Sliding gradient background */}
              <div className="absolute inset-0 w-[300px] h-full
                bg-gradient-to-r from-primary to-secondary
                -translate-x-[200%] group-hover:-translate-x-10
                transition-transform duration-500 ease-out
                -z-10"
              />
            </div>

            {/*timestamp */}
            <span className="text-xs text-gray-500 mt-0 group-hover:text-gray-700
              transition-colors duration-300"
            >
              Last used {app.lastUsed || "2d"} ago
            </span>
          </div>

          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/15
            opacity-0 group-hover:opacity-100 transition-all duration-500
            rounded-2xl -z-0"
          />
        </div>
      ))}
      {/* Backend data ends here */}
    </div>
  )
}

export default ApplicationsGrid
