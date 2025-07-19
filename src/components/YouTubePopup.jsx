import { useState } from "react";
//this is not working dono why its showing some renderer issue for jsx even though its all good > wasted 3 hrs in this stupid shit
export default function YouTubePopup() {
  const [show, setShow] = useState(false);

  return (
    <>
      <span
        className="clickable-word"
        onClick={() => setShow(true)}
        style={{ cursor: "pointer", textDecoration: "underline" }}
      >
        but I am still a newbie.
      </span>

      {show && (
        <>
          <div
            id="backdrop"
            className="backdrop"
            onClick={() => setShow(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
          />
          <div
            id="popup"
            className="popup"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "1rem",
              zIndex: 1001,
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/4K8IEzXnMYk?si=P0PeviZVfJvSVmd2"
              width="560"
              height="315"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </>
      )}
    </>
  );
}
