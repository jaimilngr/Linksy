import React from 'react';
import { useAuth } from "../../Context/Authcontext";

interface AvatarProps {
  size?: number; // Optional size prop to customize the avatar size
}

const Avatar: React.FC<AvatarProps> = ({ size = 40 }) => {
  const authContext = useAuth();
  
  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { authUser } = authContext;

  const firstInitial = authUser ? authUser[0].toUpperCase() : '';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#3B82F6', // Blue color
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size / 2, // Adjust font size based on avatar size
      }}
    >
      {firstInitial}
    </div>
  );
};

export default Avatar;
