"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; onClick?: () => void }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; onClick?: () => void }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    key={item.title}
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      border: "1px solid var(--color-accent)",
                      boxShadow: "var(--shadow-medium)"
                    }}
                  >
                    <div className="h-5 w-5" style={{ color: "var(--color-accent)" }}>{item.icon}</div>
                  </a>
                ) : (
                  <button
                    key={item.title}
                    onClick={item.onClick}
                    className="flex h-12 w-12 items-center justify-center rounded-full cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      border: "1px solid var(--color-accent)",
                      boxShadow: "var(--shadow-medium)"
                    }}
                  >
                    <div className="h-5 w-5" style={{ color: "var(--color-accent)" }}>{item.icon}</div>
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          border: "1px solid var(--color-accent)",
          boxShadow: "var(--shadow-medium)",
          backdropFilter: "blur(4px)"
        }}
      >
        <IconLayoutNavbarCollapse className="h-6 w-6" style={{ color: "var(--color-accent)" }} />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href?: string; onClick?: () => void }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-3 rounded-2xl px-4 pb-3 md:flex border-[1px] backdrop-blur-md",
        className,
      )}
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        borderColor: "var(--color-accent)",
        boxShadow: "var(--shadow-medium)"
      }}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [56, 80, 56]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [56, 80, 56]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [28, 40, 28]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [28, 40, 28],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <>
      {href ? (
        <a href={href} className="block">
          <motion.div
            ref={ref}
            style={{ 
              width, 
              height,
              backgroundColor: hovered ? "var(--color-primary)" : "rgba(15, 23, 42, 0.4)",
              boxShadow: hovered ? "0 0 15px rgba(251,191,36,0.4)" : "none",
              border: hovered ? "1px solid var(--color-accent)" : "1px solid transparent"
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative flex aspect-square items-center justify-center rounded-full transition-all duration-300"
          >
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 2, x: "-50%" }}
                  className="absolute -top-8 left-1/2 w-fit rounded-md px-2 py-0.5 text-xs whitespace-pre"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                    boxShadow: "0 0 10px rgba(251,191,36,0.2)"
                  }}
                >
                  {title}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              style={{ 
                width: widthIcon, 
                height: heightIcon,
                color: hovered ? "var(--color-accent)" : "var(--color-text-muted)",
                transition: "color var(--transition-quick) ease-in-out"
              }}
              className="flex items-center justify-center"
            >
              {icon}
            </motion.div>
          </motion.div>
        </a>
      ) : (
        <button onClick={onClick} className="block cursor-pointer">
          <motion.div
            ref={ref}
            style={{ 
              width, 
              height,
              backgroundColor: hovered ? "var(--color-primary)" : "rgba(15, 23, 42, 0.4)",
              boxShadow: hovered ? "0 0 15px rgba(251,191,36,0.4)" : "none",
              border: hovered ? "1px solid var(--color-accent)" : "1px solid transparent"
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative flex aspect-square items-center justify-center rounded-full transition-all duration-300"
          >
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 2, x: "-50%" }}
                  className="absolute -top-8 left-1/2 w-fit rounded-md px-2 py-0.5 text-xs whitespace-pre"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-accent)",
                    boxShadow: "0 0 10px rgba(251,191,36,0.2)"
                  }}
                >
                  {title}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              style={{ 
                width: widthIcon, 
                height: heightIcon,
                color: hovered ? "var(--color-accent)" : "var(--color-text-muted)",
                transition: "color var(--transition-quick) ease-in-out"
              }}
              className="flex items-center justify-center"
            >
              {icon}
            </motion.div>
          </motion.div>
        </button>
      )}
    </>
  );
}
