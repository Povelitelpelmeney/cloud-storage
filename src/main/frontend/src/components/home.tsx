import React, { useState, useEffect, useCallback } from "react";

import { getPublicContent } from "../services/user-service";

const Home: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const fetchData = useCallback(async () => {
    const response = await getPublicContent();
    setContent(response.data);
  }, []);

  useEffect(() => {
    fetchData().catch((error) => {
      const _content =
        error?.response?.data?.message || error.message || error.toString();
      setContent(_content);
    });
  }, [fetchData]);

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>{content}</h3>
      </header>
    </div>
  );
};
export default Home;
