import React from 'react'

export default function About() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="w-full flex-col justify-start items-center lg:gap-12 gap-10 inline-flex">
      <div className="w-full flex-col justify-center lg:items-start items-center lg:gap-9 gap-5 flex">
      <div className="w-full justify-center lg:items-end items-center lg:gap-8 gap-4 grid lg:grid-cols-2 grid-cols-1">
      <div className="w-full flex-col justify-start lg:items-start items-center gap-3 inline-flex">
      <span className="text-emerald-600 text-lg font-normal leading-relaxed lg:text-start text-center">About Us</span>
      <h2 className="text-gray-900 text-4xl font-bold font-manrope leading-normal lg:text-start text-center">Empower Your Business's Financial Future Effortlessly</h2>
      </div>
      <p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">Take control of your business’s financial future with effortless strategies that ensure stability and growth. Empower your decisions with expert insights, streamlining your path to long-term success. Focus on what matters most—growing your business.</p>
      </div>
      <button className="sm:w-fit w-full px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 transition-all duration-700 ease-in-out rounded-full shadow-[0px_1px_2px_0px_rgba(16,_24,_40,_0.05)] justify-center items-center flex">
      <span className="px-2 py-px text-white text-base font-semibold leading-relaxed">Get Started</span>
      </button>
      </div>
      <div className="w-full justify-start items-start lg:gap-x-8 lg:gap-y-0 gap-y-8 grid lg:grid-cols-12 grid-cols-1">
      <div className="lg:col-span-7 col-span-12 relative w-full h-full bg-gradient-to-b from-gray-900 to-gray-900 rounded-3xl flex-col justify-end items-start inline-flex">
      <img src="https://pagedone.io/asset/uploads/1723803563.png" alt="About Us image" className="rounded-3xl w-full lg:h-full h-auto object-cover"/>
      <div className="absolute md:p-8 sm:p-6 p-4 gap-4 flex flex-col rounded-3xl">
      <h3 className="text-white text-2xl font-bold font-manrope leading-9">Our Story</h3>
      <p className="text-gray-200 text-lg font-normal leading-relaxed max-[350px]:hidden">TechInnovate, a leading IT company, revolutionizes the industry with cutting-edge AI solutions, driving innovation and connectivity for businesses worldwide.</p>
      </div>
      </div>
      <div className="lg:col-span-5 col-span-12 w-full h-full flex-col justify-start items-start lg:gap-8 gap-6 inline-flex">
      <div className="w-full h-full md:p-8 sm:p-6 p-4 bg-emerald-100 rounded-3xl flex-col justify-end items-start gap-4 flex">
      <h3 className="text-gray-900 text-2xl font-bold font-manrope leading-9">Our Mission</h3>
      <p className="text-gray-500 text-lg font-normal leading-relaxed">To deliver innovative IT solutions that empower businesses.</p>
      </div>
      <div className="w-full h-full md:p-8 sm:p-6 p-4 bg-emerald-700 rounded-3xl flex-col justify-end items-start gap-4 flex">
      <h3 className="text-white text-2xl font-bold font-manrope leading-9">Our Vision</h3>
      <p className="text-gray-200 text-lg font-normal leading-relaxed">To lead in technology and shape a smarter, more connected future.</p>
      </div>
      </div>
      </div>
      </div>
      </div>
    </>
  )
}