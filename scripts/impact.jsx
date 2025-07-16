import React from 'react'

export default function Impact() {
  return (
    <>
      <div className="py-24">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <h2 className="font-manrope font-bold text-4xl text-center leading-snug text-gray-900 ">Our Blog
      </h2>
      <p className="text-base font-normal text-gray-500 text-center mt-3 mb-12 max-w-4xl px-4 mx-auto">
      Welcome to our blog, where we share expert insights, practical tips, and the latest updates on a wide range of
      topics. From industry trends and technological advancements to lifestyle advice
      </p>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="w-full lg:col-span-2 bg-cover bg-center rounded-2xl" style="background-image: url(https://pagedone.io/asset/uploads/1722665238.png);">
      <div
      className="w-full h-full bg-gradient-to-t from-gray-900/45 rounded-2xl to-gray-900/45 py-20 flex items-center justify-center flex-col">
      <h2 className="font-manrope font-bold text-3xl sm:text-5xl sm:leading-normal text-white text-center max-w-4xl mx-auto mb-6">
      It typically includes desks, chairs, computers
      </h2>
      <div className="flex items-center gap-4 mb-8">
      <img src="https://pagedone.io/asset/uploads/1722665343.png" alt="auther image" className="rounded-full object-cover"/>
      <div className="">
      <p className="text-base font-semibold text-white">Steven Nice</p>
      <div className="flex items-center gap-2.5">
      <span className="text-sm font-normal text-white">Jan 12, 2024</span>
      <div className="flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
      d="M10 7.49998V10.8333L12.5 13.3333M2.5 4.26777L4.25595 2.5M17.4984 4.27214L15.7424 2.50437M16.6667 10.8333C16.6667 14.5152 13.6819 17.5 10 17.5C6.3181 17.5 3.33333 14.5152 3.33333 10.8333C3.33333 7.15142 6.3181 4.16665 10 4.16665C13.6819 4.16665 16.6667 7.15142 16.6667 10.8333Z"
      stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm font-normal text-white">5 min</span>
      </div>
      </div>
      </div>
      </div>
      <a href="javascript:;"
      className="flex items-center gap-2 py-2.5 pr-5 pl-7 text-base leading-7 font-semibold text-white transition-all duration-500 hover:gap-3.5">Read more
      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
      <path
      d="M3 10L16.3333 10M12.1667 15L16.5774 10.5893C16.8552 10.3115 16.9941 10.1726 16.9941 10C16.9941 9.82741 16.8552 9.68852 16.5774 9.41074L12.1667 5"
      stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      </a>
      </div>
      </div>
      <div className="w-full flex flex-col gap-5 lg:max-w-2xl mx-auto">
      <img src="https://pagedone.io/asset/uploads/1722665258.png" alt="blog cover image" className="rounded-2xl w-full object-cover"/>
      <div className="">
      <h4 className="text-2xl font-manrope font-semibold leading-9 text-black mb-3.5 ">
      learn about the innovations that are reshaping
      </h4>
      <p className="text-base font-normal text-gray-500 mb-5">
      This guide highlights the essential gadgets that are shaping the future. Discover how these innovations.
      </p>
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
      <img src="https://pagedone.io/asset/uploads/1722665437.png" alt="auther image" className="rounded-full object-cover"/>
      <div className="">
      <p className="text-sm font-medium text-black mb-1">Andrea william</p>
      <span className="text-xs font-normal text-gray-500 ">21 Jan 2024</span>
      </div>
      </div>
      <p className="text-sm text-black">Marketing</p>
      </div>
      </div>
      </div>
      <div className="w-full flex flex-col gap-5 lg:max-w-2xl mx-auto">
      <img src="https://pagedone.io/asset/uploads/1722665281.png" alt="blog cover image" className="rounded-2xl object-cover"/>
      <div className="">
      <h4 className="text-2xl font-manrope font-semibold leading-9 text-black mb-3.5 ">
      Discover how technology is transforming
      </h4>
      <p className="text-base font-normal text-gray-500 mb-5">
      This guide highlights the essential gadgets that are shaping the future. Discover how these innovations.
      </p>
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
      <img src="https://pagedone.io/asset/uploads/1722665456.png" alt="auther image" className="rounded-full object-cover"/>
      <div className="">
      <p className="text-sm font-medium text-black mb-1">Mia Thompson</p>
      <span className="text-xs font-normal text-gray-500 ">22 Jan 2024</span>
      </div>
      </div>
      <p className="text-sm text-black">Business</p>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
    </>
  )
}