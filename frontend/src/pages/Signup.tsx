import { Auth } from "../components/Auth";
import { Slideshow } from "../components/slideshow";

export const Signup = () => {
  return (
    <div className="grid bg-[#171722]">
     <div className="grid grid-cols-[65%_35%]">
  <div >
    <Slideshow/>
  </div>
  <div >
    <Auth/>
  </div>
</div>
    </div>
  );
};
