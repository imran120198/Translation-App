export const SelectBox = ({ id, select }) => {
  return (
    <>
      <div className="select">
        <select id={id} onChange={select}>
          <option value="">Select Language</option>
          <option value="en">English</option>
          <option value="hi"> Hindi</option>
          <option value="es">Spanish</option>
          <option value="de">German</option>
          <option value="fr"> French</option>
          <option value="tr"> Turkish</option>
          <option value="ar">Arabic</option>
          <option value="ur">Urdu</option>
          <option value="ko">Korean</option>
          <option value="ru">Russian</option>
          <option value="zh">Chinese</option>
          <option value="cs">Czech</option>
        </select>
      </div>
    </>
  );
};
