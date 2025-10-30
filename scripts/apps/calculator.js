apps.calculator = {
    title: 'Calculator',
    icon: 'images/calculator.ico',
    windowClass: 'calculator-window',
    contentClass: 'calculator-content',
    getContent: function () {
        return `
            <div class="calculator-display">0</div>
            <div class="calculator-buttons">
                <button class="calculator-button" data-value="7">7</button>
                <button class="calculator-button" data-value="8">8</button>
                <button class="calculator-button" data-value="9">9</button>
                <button class="calculator-button" data-value="/">÷</button>
                <button class="calculator-button" data-value="4">4</button>
                <button class="calculator-button" data-value="5">5</button>
                <button class="calculator-button" data-value="6">6</button>
                <button class="calculator-button" data-value="*">×</button>
                <button class="calculator-button" data-value="1">1</button>
                <button class="calculator-button" data-value="2">2</button>
                <button class="calculator-button" data-value="3">3</button>
                <button class="calculator-button" data-value="-">−</button>
                <button class="calculator-button" data-value="0">0</button>
                <button class="calculator-button" data-value=".">.</button>
                <button class="calculator-button" data-value="=">=</button>
                <button class="calculator-button" data-value="+">+</button>
                <button class="calculator-button span-2" data-value="C">C</button>
                <button class="calculator-button span-2" data-value="CE">CE</button>
            </div>
        `;
    },
    init: function (windowElement) {
        const display = windowElement.querySelector('.calculator-display');
        const buttons = windowElement.querySelectorAll('.calculator-button');
        let currentValue = '0';
        let previousValue = null;
        let operation = null;
        let shouldResetDisplay = false;
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                const value = this.getAttribute('data-value');
                if (value === 'C' || value === 'CE') {
                    currentValue = '0';
                    previousValue = null;
                    operation = null;
                    shouldResetDisplay = false;
                    display.textContent = currentValue;
                } else if (value === '=') {
                    if (operation && previousValue !== null) {
                        currentValue = calculate(previousValue, currentValue, operation);
                        display.textContent = currentValue;
                        previousValue = null;
                        operation = null;
                        shouldResetDisplay = true;
                    }
                } else if (['+', '-', '*', '/'].includes(value)) {
                    if (operation && previousValue !== null && !shouldResetDisplay) {
                        currentValue = calculate(previousValue, currentValue, operation);
                        display.textContent = currentValue;
                    }
                    previousValue = currentValue;
                    operation = value;
                    shouldResetDisplay = true;
                } else {
                    if (shouldResetDisplay || currentValue === '0') {
                        currentValue = value;
                        shouldResetDisplay = false;
                    } else {
                        currentValue += value;
                    }
                    display.textContent = currentValue;
                }
            });
        });
        function calculate(a, b, op) {
            const num1 = parseFloat(a);
            const num2 = parseFloat(b);
            switch (op) {
                case '+': return String(num1 + num2);
                case '-': return String(num1 - num2);
                case '*': return String(num1 * num2);
                case '/': return num2 !== 0 ? String(num1 / num2) : 'Error';
                default: return b;
            }
        }
    }
};