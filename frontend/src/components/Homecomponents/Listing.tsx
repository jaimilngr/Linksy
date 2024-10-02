import { Link } from "react-router-dom";

export const Service = () => {
  return (
    <div className="flex flex-col md:flex-row md:p-10 justify-around border-t-2 border-gray-300">
      <div className="p-5 md:w-5/12 h-auto flex justify-center">
        <img
          className="w-full h-auto object-cover rounded-lg"
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
        />
      </div>
      <div className="flex justify-center flex-col items-center md:w-5/12">
        <div className="text-3xl md:text-5xl font-semibold">
          Start As <span className="text-accent">Service</span> Provider
        </div>
        <div className="text-xl p-5 md:text-xl ml-3">
          Empower your business by listing your services with us. Our platform connects you with a diverse range of clients looking for skilled professionals like you.
          <br /> <br />
          Highlight your expertise, set your availability, and start engaging with potential customers. Join today and take advantage of new opportunities to expand your reach!
          <div className="flex justify-center md:justify-start mt-8">
            <div className="bg-blue-500 text-white rounded-md p-3 max-w-max hover:bg-background hover:cursor-pointer hover:text-blue-500 hover:border-blue-700 border-2 dark:hover:text-white dark:border-2 dark:border-background dark:hover:border-blue-700 mb-8">
              <Link to="/signup">
                <button >Become a provider</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
