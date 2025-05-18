import { Tabs } from "expo-router";
import React from "react";

const TabsLayout: React.FC = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default TabsLayout; 