//***********************
//  BUDGET CONTROLLER
//***********************

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1

    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id;
            } else {
                ID = 0;
            }

            //create new item based on exp or inc
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        calculateBudget: function () {

            // 1. calculate total income & expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. calculate the budget: income- expense
            data.budget = data.totals['inc'] - data.totals['exp'];

            // 3. calculate percentage of income spent
            if(data.totals.inc>0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage=-1;
            }
            

        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }      
        }
    };
})();


//***********************
//  UI CONTROLLER
//***********************


var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        perecntageLabel: '.budget__expenses--percentage'
    };

    return {
        getinput: function () {

            return {
                type: document.querySelector(DOMStrings.inputType).value, //will be either or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItems: function (obj, type) {

            var html, newHtml;

            // 1. create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = '<div class = "item clearfix" id = "income-%id%" ><div class = "item__description" >%description% </div> <div class = "right clearfix" ><div class = "item__value" >%value%</div> <div class = "item__delete" ><button class = "item__delete--btn" > <i class = "ion-ios-close-outline" > </i></button ></div> </div > </div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //3. Insert the html data into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {

            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue); //returns list not array

            var fieldsArr = Array.prototype.slice.call(fields); //slices list to array

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            document.querySelector(DOMStrings.budgetLabel).textContent=obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent=obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent=obj.totalExp;
            
            if(obj.percentage>0){
            document.querySelector(DOMStrings.perecntageLabel).textContent=obj.percentage+'%';
                
            }else{
                document.querySelector(DOMStrings.perecntageLabel).textContent='---';
            }
        },

        getDOMstrings: function () {
            return DOMStrings;
        }
    };
})();


//***********************
//  GLOBAL APP CONTROLLER
//***********************


var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlADDItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {

                ctrlADDItem();

            }
        });

    }

    var updateBudget = function () {
        //1. Calculate budget
        budgetCtrl.calculateBudget();
        
        //2. return budget
        var budget=budgetCtrl.getBudget();

        //3. Display budget on UI
        UICtrl.displayBudget(budget);
    };

    var ctrlADDItem = function () {

        var input, newItem;

        // 1. Get input data
        input = UICtrl.getinput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add item to budgte controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add the new item to user intreface
            UICtrl.addListItems(newItem, input.type);

            //3.1 clera the fields
            UICtrl.clearFields();

            //4. Calculate and update budget
            updateBudget();

        }
    }

    return {
        init: function () {
            console.log('APPLICATION has started');
            UICtrl.displayBudget({
                 budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);


controller.init();
