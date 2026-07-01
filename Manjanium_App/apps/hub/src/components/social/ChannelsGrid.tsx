import React from "react";
import { motion } from "framer-motion";
import { ChannelCard, ChannelCardProps } from "./ChannelCard";

interface ChannelsGridProps {
  channels: ChannelCardProps[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
};

export function ChannelsGrid({ channels }: ChannelsGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
    >
      {channels.map((channel, index) => (
        <motion.div key={index} variants={itemVariants} className="w-full">
          <ChannelCard {...channel} />
        </motion.div>
      ))}
    </motion.div>
  );
}
