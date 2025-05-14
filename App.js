// UltraSimpleCalculatorV3_Rows.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList } from 'react-native';

const { width } = Dimensions.get('window');
const NUM_COLUMNS_FOR_CALC = 4; // We conceptually think in 4 columns for sizing
const BUTTON_ROW_MARGIN_BOTTOM = 10;
const BUTTON_INTER_MARGIN = 10; // Margin between buttons in a row
const BUTTON_CONTAINER_PADDING_HORIZONTAL = 10; // Padding on the sides of the button area

// Calculate the size of a single "slot" in our 4-column grid
const BUTTON_SLOT_SIZE =
  (width - BUTTON_CONTAINER_PADDING_HORIZONTAL * 2 - BUTTON_INTER_MARGIN * (NUM_COLUMNS_FOR_CALC - 1)) /
  NUM_COLUMNS_FOR_CALC;

export default function App() {
  const [display, setDisplay] = useState('0');
  const [operand1, setOperand1] = useState(null);
  const [operator, setOperator] = useState(null);
  const [isNextInputNew, setIsNextInputNew] = useState(false);

  const performCalculation = () => {
    const num1 = parseFloat(operand1);
    const num2 = parseFloat(display);
    if (isNaN(num1) || isNaN(num2)) return 'Error';
    switch (operator) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '*': return num1 * num2;
      case '/': return num2 === 0 ? 'Error' : num1 / num2;
      default: return 'Error';
    }
  };

  const handleNumberPress = (number) => {
    if (display === 'Error') { setDisplay(String(number)); setIsNextInputNew(false); return; }
    if (isNextInputNew) { setDisplay(String(number)); setIsNextInputNew(false); }
    else { setDisplay(display === '0' ? String(number) : display + number); }
  };

  const handleDecimalPress = () => {
    if (display === 'Error') { setDisplay('0.'); setIsNextInputNew(false); return; }
    if (isNextInputNew) { setDisplay('0.'); setIsNextInputNew(false); }
    else if (!display.includes('.')) { setDisplay(display + '.'); }
  };

  const handleOperatorPress = (op) => {
    if (display === 'Error') return;
    if (operand1 !== null && operator && !isNextInputNew) {
      const result = performCalculation();
      if (result === 'Error') {
        setDisplay('Error'); setOperand1(null); setOperator(null); setIsNextInputNew(true); return;
      }
      setDisplay(String(result)); setOperand1(String(result));
    } else {
      setOperand1(display);
    }
    setOperator(op); setIsNextInputNew(true);
  };

  const handleEqualsPress = () => {
    if (operand1 && operator && !isNextInputNew) {
      const result = performCalculation();
      setDisplay(String(result));
      setOperand1(null); setOperator(null); setIsNextInputNew(true);
    }
  };

  const handleClearPress = () => {
    setDisplay('0'); setOperand1(null); setOperator(null); setIsNextInputNew(false);
  };

  // --- Button Layout Definition (Array of Rows) ---
  // Each inner array is a row. Each object is a button in that row.
  // `text`: Display text. `op`: Operator value. `action`: Special action. `span`: Column span.
  const buttonRows = [
    [
      { id: 'ac', text: 'AC', action: handleClearPress, styleType: 'lightGray', span: 3 },
      { id: 'divide', text: '÷', op: '/', action: () => handleOperatorPress('/'), styleType: 'orange', span: 1 },
    ],
    [
      { id: '7', text: '7', action: () => handleNumberPress('7'), styleType: 'darkGray' },
      { id: '8', text: '8', action: () => handleNumberPress('8'), styleType: 'darkGray' },
      { id: '9', text: '9', action: () => handleNumberPress('9'), styleType: 'darkGray' },
      { id: 'multiply', text: '×', op: '*', action: () => handleOperatorPress('*'), styleType: 'orange' },
    ],
    [
      { id: '4', text: '4', action: () => handleNumberPress('4'), styleType: 'darkGray' },
      { id: '5', text: '5', action: () => handleNumberPress('5'), styleType: 'darkGray' },
      { id: '6', text: '6', action: () => handleNumberPress('6'), styleType: 'darkGray' },
      { id: 'subtract', text: '-', op: '-', action: () => handleOperatorPress('-'), styleType: 'orange' },
    ],
    [
      { id: '1', text: '1', action: () => handleNumberPress('1'), styleType: 'darkGray' },
      { id: '2', text: '2', action: () => handleNumberPress('2'), styleType: 'darkGray' },
      { id: '3', text: '3', action: () => handleNumberPress('3'), styleType: 'darkGray' },
      { id: 'add', text: '+', op: '+', action: () => handleOperatorPress('+'), styleType: 'orange' },
    ],
    [
      { id: '0', text: '0', action: () => handleNumberPress('0'), styleType: 'darkGray', span: 2 },
      { id: 'decimal', text: '.', action: handleDecimalPress, styleType: 'darkGray' },
      { id: 'equals', text: '=', action: handleEqualsPress, styleType: 'orange' },
    ],
  ];

  // --- Render a Single Button ---
  const renderCalculatorButton = (buttonConfig, index, isLastInRow) => {
    const span = buttonConfig.span || 1;
    const buttonWidth = BUTTON_SLOT_SIZE * span + BUTTON_INTER_MARGIN * (span - 1);

    let buttonStyle = [styles.button, { width: buttonWidth }];
    let textStyle = [styles.buttonText];

    if (!isLastInRow) { // Add right margin to all but the last button in a row
      buttonStyle.push({ marginRight: BUTTON_INTER_MARGIN });
    }

    if (buttonConfig.styleType === 'lightGray') {
      buttonStyle.push(styles.buttonLightGray);
      textStyle.push(styles.textBlack);
    } else if (buttonConfig.styleType === 'darkGray') {
      buttonStyle.push(styles.buttonDarkGray);
    } else if (buttonConfig.styleType === 'orange') {
      buttonStyle.push(styles.buttonOrange);
    }

    if (buttonConfig.text === '0' && span > 1) buttonStyle.push(styles.buttonZeroAlign);
    if (buttonConfig.text === 'AC' && span > 1) buttonStyle.push(styles.buttonAcAlign);


    return (
      <TouchableOpacity
        key={buttonConfig.id}
        style={buttonStyle}
        onPress={buttonConfig.action}
      >
        <Text style={textStyle}>{buttonConfig.text}</Text>
      </TouchableOpacity>
    );
  };

  // --- Render a Row of Buttons ---
  const renderButtonRow = ({ item: rowButtons, index: rowIndex }) => (
    <View style={styles.buttonRow}>
      {rowButtons.map((buttonConfig, buttonIndex) =>
        renderCalculatorButton(buttonConfig, buttonIndex, buttonIndex === rowButtons.length - 1)
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText} numberOfLines={1} ellipsizeMode="head">
          {display}
        </Text>
      </View>
      <View style={styles.buttonsAreaContainer}>
        <FlatList
          data={buttonRows}
          renderItem={renderButtonRow}
          keyExtractor={(item, index) => `row-${index}`}
        />
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  displayContainer: {
    paddingHorizontal: 25,
    paddingBottom: 20,
    alignItems: 'flex-end',
    minHeight: 100,
  },
  displayText: {
    fontSize: 70,
    color: '#fff',
    fontWeight: '300',
  },
  buttonsAreaContainer: { // Container for all button rows
    paddingHorizontal: BUTTON_CONTAINER_PADDING_HORIZONTAL,
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: BUTTON_ROW_MARGIN_BOTTOM,
    // justifyContent: 'space-between', // No longer needed with explicit margins
  },
  button: {
    height: BUTTON_SLOT_SIZE,
    borderRadius: BUTTON_SLOT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: BUTTON_SLOT_SIZE * 0.4,
    color: '#fff',
  },
  buttonLightGray: { backgroundColor: '#a5a5a5' },
  buttonDarkGray: { backgroundColor: '#333333' },
  buttonOrange: { backgroundColor: '#f1a33c' },
  textBlack: { color: '#000' },
  buttonZeroAlign: {
    alignItems: 'flex-start',
    paddingLeft: BUTTON_SLOT_SIZE * 0.35,
  },
  buttonAcAlign: {
    alignItems: 'flex-start',
    paddingLeft: BUTTON_SLOT_SIZE * 0.35,
  },
});