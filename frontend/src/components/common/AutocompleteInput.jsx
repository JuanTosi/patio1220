import { useState, useEffect, useRef } from "react";
import { Form, FormGroup, Spinner } from "react-bootstrap";
import "../../styles/components/AutocompleteInput.css";

const AutocompleteInput = ({
  value,
  onChange,
  suggestions = [],
  placeholder = "Escribir...",
  disabled = false,
  loading = false,
  label = "",
  required = false,
  error = "",
  onSelect = null,
  onConfirm = null,
  renderSuggestion = null,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (!value || value.trim() === "") {
      setFilteredSuggestions([]);
      setIsOpen(false);
      return;
    }
    const searchTerm = value.toLowerCase().trim();
    const filtered = suggestions.filter((item) =>
      item.nombre.toLowerCase().includes(searchTerm),
    );

    setFilteredSuggestions(filtered);
    const esExacta = suggestions.some(
      (item) => item.nombre.toLowerCase() === value.toLowerCase().trim(),
    );

    setIsOpen(filtered.length > 0 && !disabled && !esExacta);
    setHighlightedIndex(-1);
  }, [value, suggestions, disabled]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleSelectSuggestion = (suggestion) => {
    justSelectedRef.current = true;
    onChange(suggestion.nombre);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0) {
        handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
      } else {
        if (onConfirm) onConfirm(value);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
        } else {
          if (onConfirm) onConfirm(value);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      default:
        break;
    }
  };

  const handleFocus = () => {
    if (value && filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <FormGroup className={`autocomplete-container ${className}`}>
      {label && (
        <Form.Label>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      <div className="autocomplete-input-wrapper">
        <Form.Control
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          isInvalid={!!error}
          autoComplete="off"
        />

        {isOpen && !loading && (
          <div ref={dropdownRef} className="autocomplete-dropdown">
            {filteredSuggestions.length === 0 ? (
              <div className="autocomplete-item autocomplete-no-results">
                No se encontraron resultados
              </div>
            ) : (
              filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`autocomplete-item ${index === highlightedIndex ? "highlighted" : ""
                    }`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {renderSuggestion
                    ? renderSuggestion(suggestion)
                    : suggestion.nombre}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
          {error}
        </Form.Control.Feedback>
      )}
    </FormGroup>
  );
};

export default AutocompleteInput;
