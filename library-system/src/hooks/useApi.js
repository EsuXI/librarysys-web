import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
export default function useApi(url) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    api
      .get(url)
      .then((response) => {
        if (active)
          setState({ data: response.data, loading: false, error: "" });
      })
      .catch((error) => {
        if (active)
          setState({ data: null, loading: false, error: errorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [url, version]);
  function reload() {
    setState((previous) => ({ ...previous, loading: true }));
    setVersion((value) => value + 1);
  }
  return { ...state, reload };
}
