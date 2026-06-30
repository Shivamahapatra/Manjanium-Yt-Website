"use client";

import { useState, useEffect } from "react";

const ONBOARDING_KEY = "manjanium_onboarding_shown";
const USER_MODE_KEY = "manjanium_user_mode";

export function useOnboarding() {
  const [showModal, setShowModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if onboarding has been shown
    const onboardingShown = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingShown) {
      // Delay slightly to let content load first
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Check user mode
    const userMode = localStorage.getItem(USER_MODE_KEY);
    if (userMode === "guest") {
      setIsGuest(true);
    }
  }, []);

  const dismissModal = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    localStorage.setItem(USER_MODE_KEY, "guest");
    setShowModal(false);
    setIsGuest(true);
  };

  const setLoginIntention = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowModal(false);
  };

  return {
    showModal: isMounted ? showModal : false,
    dismissModal,
    setLoginIntention,
    isGuest: isMounted ? isGuest : false,
  };
}
