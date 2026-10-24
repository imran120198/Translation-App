export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ur", name: "Urdu" },
  { code: "ar", name: "Arabic" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "tr", name: "Turkish" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "cs", name: "Czech" },
];

export const SelectBox = ({ id, select, value }) => {
  return (
    <div className="selectWrapper">
      <select
        id={id}
        onChange={select}
        value={value || ""}
        className="modernSelect"
        aria-label="Select language"
      >
        <option value="">Choose Language...</option>
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
