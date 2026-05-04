module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        myRegular: ["Montserrat_400Regular"],
        myMedium: ["Montserrat_500Medium"],
        mySemiBold: ["Montserrat_600SemiBold"],
        myBold: ["Montserrat_700Bold"],
      },
    },
  },
  plugins: [],
};
