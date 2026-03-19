import React from "react";

const EconomicCalendar = () => {
  return (
    <div className="p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">경제 캘린더</h1>
      <p className="text-sm text-gray-500 mb-6">
        모든 지표 시간은 한국 시간(KST) 기준입니다.
      </p>
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <iframe
          src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&category=_main&features=datepicker,timezone&countries=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30&calType=day&timeZone=88&lang=18"
          width="100%"
          height="1000px"
          frameBorder="0"
          allowTransparency={true}
        ></iframe>
      </div>
    </div>
  );
};

export default EconomicCalendar;
