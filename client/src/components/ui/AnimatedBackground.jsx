import React from "react";

export default function AnimatedBackground() {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-b from-orange-50 via-white to-orange-100">
        {/* Soft gradient blobs - slower animation */}
        <div className="absolute top-10 right-20 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-0 left-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "0.8s" }}
        />

        {/* Floating Medical Icons - Much more movement */}
        {/* Stethoscope */}
        <div
          className="absolute top-1/4 left-10 animate-float-large"
          style={{ animationDelay: "0s" }}
        >
          <svg
            className="w-20 h-22 text-orange-400/50"
            fill="currentColor"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <title>stethoscope</title>{" "}
              <path d="M16.56 13c0-1.32-1.080-2.4-2.4-2.4s-2.4 1.080-2.4 2.4c0 1.040 0.64 1.92 1.56 2.24v4.92c0 2.84-2.88 3.040-3.76 3.040s-3.76-0.2-3.76-3.040v-1.88c2.28-0.36 4.16-2.080 4.16-3.92v-4.96c0-0.84-0.48-1.6-1.2-1.96-0.64-0.32-1.24-0.4-1.72-0.2-0.44 0.16-0.64 0.6-0.48 1.040s0.64 0.68 1.040 0.52c0.040 0 0.16 0 0.44 0.12 0.16 0.080 0.28 0.28 0.28 0.48v4.92c0 0.92-1.4 2.32-3.32 2.32s-3.32-1.4-3.32-2.32v-4.92c0-0.2 0.12-0.4 0.28-0.48 0.24-0.12 0.4-0.12 0.44-0.12 0.44 0.16 0.92-0.080 1.080-0.52s-0.080-0.92-0.52-1.080c-0.52-0.2-1.12-0.12-1.72 0.2-0.76 0.36-1.2 1.12-1.2 1.96v4.92c0 1.88 1.88 3.56 4.16 3.92v1.88c0 3.24 2.72 4.72 5.4 4.72s5.4-1.44 5.4-4.72v-4.84c0.88-0.32 1.56-1.2 1.56-2.24zM14.16 12.24c0.4 0 0.76 0.32 0.76 0.76 0 0.4-0.32 0.76-0.76 0.76-0.4 0-0.76-0.32-0.76-0.76 0-0.4 0.32-0.76 0.76-0.76z"></path>{" "}
            </g>
          </svg>
        </div>

        {/* Heart Monitor */}
        <div
          className="absolute top-1/3 right-16 animate-float-large"
          style={{ animationDelay: "1s" }}
        >
          <svg
            className="w-24 h-24 text-orange-500/45"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* Medical Cross */}
        <div
          className="absolute bottom-1/4 left-1/4 animate-float-large"
          style={{ animationDelay: "0.5s" }}
        >
          <svg
            className="w-18 h-18 text-orange-400/50"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
          </svg>
        </div>

        {/* Pills */}
        <div
          className="absolute top-2/3 right-1/4 animate-float-large"
          style={{ animationDelay: "1.5s" }}
        >
          <svg
            className="w-20 h-20 text-orange-400/50"
            fill="currentColor"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 489.575 489.575"
            xmlSpace="preserve"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <g>
                <g>
                  <g>
                    <path d="M458.85,30.675c-40.8-40.9-107.2-40.9-148,0l-140.3,139.9l148.1,148.1l140.2-140 C499.75,137.875,499.75,71.475,458.85,30.675z"></path>
                    <path d="M30.65,310.875c-40.8,40.8-40.8,107.3,0,148.1s107.3,40.8,148.1,0l125.9-125.9l-148.1-148.2L30.65,310.875z"></path>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>

        {/* Microscope */}
        <div
          className="absolute bottom-1/3 right-10 animate-float-large"
          style={{ animationDelay: "0.8s" }}
        >
          <svg
            className="w-18 h-18 text-orange-400/50"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M3 20C2.44772 20 2 20.4477 2 21C2 21.5523 2.44772 22 3 22V20ZM21 22C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20V22ZM7 17C6.44772 17 6 17.4477 6 18C6 18.5523 6.44772 19 7 19V17ZM14 19C14.5523 19 15 18.5523 15 18C15 17.4477 14.5523 17 14 17V19ZM9 14C8.44772 14 8 14.4477 8 15C8 15.5523 8.44772 16 9 16V14ZM12 16C12.5523 16 13 15.5523 13 15C13 14.4477 12.5523 14 12 14V16ZM8 5V4C7.44772 4 7 4.44772 7 5H8ZM13 5H14C14 4.44772 13.5523 4 13 4V5ZM13 12V13C13.5523 13 14 12.5523 14 12H13ZM8 12H7C7 12.5523 7.44772 13 8 13V12ZM9 5V6C9.45887 6 9.85885 5.6877 9.97014 5.24254L9 5ZM11.5 3L12.4701 2.75746C12.3589 2.3123 11.9589 2 11.5 2V3ZM9.5 3V2C9.04113 2 8.64115 2.3123 8.52986 2.75746L9.5 3ZM12 5L11.0299 5.24254C11.1411 5.6877 11.5411 6 12 6V5ZM13 7C12.4477 7 12 7.44772 12 8C12 8.55228 12.4477 9 13 9V7ZM16.0915 20.1435C15.6184 20.4285 15.466 21.0431 15.7511 21.5161C16.0361 21.9892 16.6506 22.1416 17.1237 21.8565L16.0915 20.1435ZM3 22H21V20H3V22ZM7 19H14V17H7V19ZM9 16H12V14H9V16ZM12 5V12H14V5H12ZM13 11H8V13H13V11ZM9 12V5H7V12H9ZM8 6H9V4H8V6ZM9.97014 5.24254L10.4701 3.24254L8.52986 2.75746L8.02986 4.75746L9.97014 5.24254ZM9.5 4H11.5V2H9.5V4ZM10.5299 3.24254L11.0299 5.24254L12.9701 4.75746L12.4701 2.75746L10.5299 3.24254ZM12 6H13V4H12V6ZM13 9C16.3137 9 19 11.6863 19 15H21C21 10.5817 17.4183 7 13 7V9ZM19 15C19 17.1814 17.8365 19.092 16.0915 20.1435L17.1237 21.8565C19.4443 20.4582 21 17.9113 21 15H19Z"
                fill="#fb923c80"
              ></path>{" "}
            </g>
          </svg>
        </div>

        {/* DNA Helix */}
        <div
          className="absolute top-1/2 left-1/3 animate-float-large"
          style={{ animationDelay: "1.2s" }}
        >
          <svg
            className="w-18 h-18 text-orange-400/50"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M19 21C19 20.663 18.9818 20.3293 18.9463 20M5 3C5 3.33701 5.01817 3.67071 5.0537 4M5 21C5 16.8566 7.74671 13.2152 11.7307 12.077L12.2693 11.923C16.2533 10.7848 19 7.14339 19 3M15 4H5.0537M12.5 8H6.46206M9 20H18.9463M11.5 16H17.5379M18.9463 20C18.7899 18.5509 18.2974 17.187 17.5379 16M17.5379 16C16.3482 14.1405 14.5033 12.7152 12.2693 12.077L11.7307 11.923C9.49674 11.2848 7.65184 9.8595 6.46206 8M5.0537 4C5.21006 5.44909 5.70259 6.81301 6.46206 8"
                stroke="#fb923c80"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>{" "}
            </g>
          </svg>
        </div>

        {/* Hospital Building */}
        <div
          className="absolute bottom-10 left-16 animate-float-large"
          style={{ animationDelay: "0.3s" }}
        >
          <svg
            className="w-18 h-18 text-orange-400/50"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M22 22L2 22"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
              <path
                d="M17 22V6C17 4.11438 17 3.17157 16.4142 2.58579C15.8284 2 14.8856 2 13 2H11C9.11438 2 8.17157 2 7.58579 2.58579C7 3.17157 7 4.11438 7 6V22"
                stroke="#fb923c80"
                stroke-width="1.5"
              ></path>{" "}
              <path
                d="M12 22V19"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
              <path
                d="M10 12H14"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
              <path
                d="M5.5 11H7"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
              <path
                d="M5.5 14H7"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
              <path
                d="M17 11H18.5"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
              <path
                d="M17 14H18.5"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
              <path
                d="M5.5 8H7"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
              <path
                d="M17 8H18.5"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
              <path
                d="M12 9V5"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>{" "}
              <path
                d="M14 7L10 7"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>{" "}
              <path
                d="M20.25 8.5C20.25 8.91421 20.5858 9.25 21 9.25C21.4142 9.25 21.75 8.91421 21.75 8.5H20.25ZM20.1111 5.33706L19.6945 5.96066L19.6945 5.96066L20.1111 5.33706ZM20.6629 5.88886L20.0393 6.30554L20.0393 6.30554L20.6629 5.88886ZM21.75 12.5C21.75 12.0858 21.4142 11.75 21 11.75C20.5858 11.75 20.25 12.0858 20.25 12.5H21.75ZM17.5 5.75C18.2178 5.75 18.6998 5.75091 19.0672 5.78828C19.422 5.82438 19.586 5.8882 19.6945 5.96066L20.5278 4.71346C20.1318 4.44886 19.6925 4.34415 19.219 4.29598C18.758 4.24909 18.1866 4.25 17.5 4.25V5.75ZM21.75 8.5C21.75 7.81338 21.7509 7.24196 21.704 6.78102C21.6559 6.30755 21.5511 5.86818 21.2865 5.47218L20.0393 6.30554C20.1118 6.41399 20.1756 6.57796 20.2117 6.93283C20.2491 7.30023 20.25 7.78216 20.25 8.5H21.75ZM19.6945 5.96066C19.831 6.05186 19.9481 6.16905 20.0393 6.30554L21.2865 5.47218C21.0859 5.17191 20.8281 4.91409 20.5278 4.71346L19.6945 5.96066ZM20.25 12.5V22H21.75V12.5H20.25Z"
                fill="#fb923c80"
              ></path>{" "}
              <path
                d="M3.88886 5.33706L4.30554 5.96066L4.30554 5.96066L3.88886 5.33706ZM3.33706 5.88886L3.96066 6.30554L3.96066 6.30554L3.33706 5.88886ZM3.75 17C3.75 16.5858 3.41421 16.25 3 16.25C2.58579 16.25 2.25 16.5858 2.25 17H3.75ZM2.25 13C2.25 13.4142 2.58579 13.75 3 13.75C3.41421 13.75 3.75 13.4142 3.75 13H2.25ZM6.5 4.25C5.81338 4.25 5.24196 4.24909 4.78102 4.29598C4.30755 4.34415 3.86818 4.44886 3.47218 4.71346L4.30554 5.96066C4.41399 5.8882 4.57796 5.82438 4.93283 5.78828C5.30023 5.75091 5.78216 5.75 6.5 5.75V4.25ZM3.75 8.5C3.75 7.78216 3.75091 7.30023 3.78828 6.93283C3.82438 6.57796 3.8882 6.41399 3.96066 6.30554L2.71346 5.47218C2.44886 5.86818 2.34415 6.30755 2.29598 6.78102C2.24909 7.24196 2.25 7.81338 2.25 8.5H3.75ZM3.47218 4.71346C3.17191 4.91409 2.91409 5.17191 2.71346 5.47218L3.96066 6.30554C4.05186 6.16905 4.16905 6.05186 4.30554 5.96066L3.47218 4.71346ZM2.25 17V22H3.75V17H2.25ZM2.25 8.5V13H3.75V8.5H2.25Z"
                fill="#fb923c80"
              ></path>{" "}
              <path
                d="M10 15H10.5M14 15H12.5"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
            </g>
          </svg>
        </div>

        {/* Syringe */}
        <div
          className="absolute top-3/4 left-1/2 animate-float-large"
          style={{ animationDelay: "1.8s" }}
        >
          <svg
            className="w-20 h-20 text-orange-400/50"
            fill="currentColor"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 489.921 489.921"
            xmlSpace="preserve"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <g>
                <g>
                  <g>
                    <path d="M455.767,34.296c-24.1-24.1-48.6-38.9-54.4-33c-4.7,4.7,3.9,21.8,20.6,40.8l-90.2,90.2l-32.2-32.3l-17.9,17.9l91.7,91.3 l17.9-17.9l-33.8-33.4l90.2-89.8c19,16.3,36.1,25.3,40.8,20.6C494.667,82.496,479.867,58.396,455.767,34.296z"></path>
                    <polygon points="366.767,69.696 346.967,50.196 312.367,84.796 331.767,104.296 "></polygon>
                    <polygon points="385.467,157.896 405.267,177.296 439.867,142.696 420.067,123.296 "></polygon>
                    <polygon points="100.967,295.496 193.867,388.396 359.367,223.196 266.167,130.296 "></polygon>
                    <polygon points="93.167,343.296 147.167,396.896 161.167,383.296 107.167,329.296 "></polygon>
                    <path d="M82.267,382.896l5.4,5.4l-84.7,84.7c-3.9,3.9-3.9,10.1,0,14l0,0c3.9,3.9,10.1,3.9,14,0l84.7-84.7l5.4,5.4l11.3-11.3 l-25.3-24.9L82.267,382.896z"></path>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>

        {/* Test Tube */}
        <div
          className="absolute top-1/5 right-1/3 animate-float-large"
          style={{ animationDelay: "0.6s" }}
        >
          <svg
            className="w-18 h-18 text-orange-400/50"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M6.8008 11.7834L8.07502 11.9256C9.09772 12.0398 9.90506 12.8507 10.0187 13.8779C10.1062 14.6689 10.6104 15.3515 11.3387 15.665L13 16.3547M13 16.3547L9.48838 19.8818C8.00407 21.3727 5.59754 21.3727 4.11323 19.8818C2.62892 18.391 2.62892 15.9738 4.11323 14.4829L14.8635 3.68504L20.2387 9.08398L18.429 10.9017M13 16.3547L16 13.3414M21 9.84867L14.1815 3"
                stroke="#fb923c80"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>{" "}
            </g>
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-large {
          0% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-40px) translateX(20px) rotate(8deg);
          }
          66% {
            transform: translateY(-25px) translateX(-15px) rotate(-5deg);
          }
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
        }

        @keyframes gradient-slow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        .animate-float-large {
          animation: float-large 10s ease-in-out infinite;
        }

        .animate-gradient-slow {
          background-size: 300% 300%;
          animation: gradient-slow 8s ease infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
