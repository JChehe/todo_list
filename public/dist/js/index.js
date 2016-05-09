var LIB = LIB || {};


;
(function(window, LIB) {
    var $dom = LIB.util.Dom,
        $event = LIB.util.Event,
        $localStorage = LIB.util.localStorage;

    function App() {
        this.ENTER_KEY = 13;
        this.ESCAPE_KEY = 27;

        this.$todoList = qs(".todo-list");
        this.$todoItemCounter = qs(".todo-count");
        this.$clearCompleted = qs(".clear-completed");
        this.$main = qs(".main");
        this.$footer = qs(".footer");
        this.$toggleAll = qs(".toggle-all");
        this.$newTodo = qs(".new-todo");
        this.$filters = qs(".filters");

        this.data = [];
    }

    App.prototype.init = function() {
        var localData = $localStorage.get("data") || [];
        this.data = localData;
        this._bind();
        this._filterItem(getHash());
        this._checkIsAllCompleted();
    };



    App.prototype._addItemHandler = function(arg_obj) {
        arg_obj.status = "active";
        var newItem = createItem(arg_obj);
        this.$newTodo.value = "";
        this._method.add.call(this, arg_obj);

        if (getHash() !== "completed") {
            this.$todoList.appendChild(newItem);
        }
        this._updateLeftItemCount();
    };

    App.prototype._removeItemHandler = function(id) {
        var ele = qs("[data-id='" + id + "']");
        if (ele) {
            this.$todoList.removeChild(ele);
            this._method.delById.call(this, id);
            this._updateLeftItemCount();
        }
    };

    App.prototype._editStatus = function(id) {
        var ele = qs("[data-id='" + id + "']");
        if (ele) {
            var label = qs("label", ele);
            var editInput = document.createElement("input");
            editInput.value = label.innerHTML;
            editInput.className = "edit";
            ele.appendChild(editInput);
            ele.classList.add("editing");

            editInput.focus();
        }
    };

    App.prototype._editDoneHandler = function(arg_obj) {
        var ele = qs("[data-id='" + arg_obj.id + "']");

        if (ele) {
            var editInput = qs("input.edit", ele),
                label = qs("label", ele);

            label.innerHTML = arg_obj.value;
            ele.classList.remove('editing');
            $dom.remove(editInput);
        }
    };

    App.prototype._updateLeftItemCount = function() {
        var counter = 0;
        var ele = qs("strong", this.$todoItemCounter);

        if (ele) {
            this.data.forEach(function(cData) {
                if (cData.status === "active") {
                    counter++;
                }
            });
            ele.innerHTML = counter;

            if (counter < this.data.length) {
                this._toggleClearCompleted(true);
            } else {
                this._toggleClearCompleted(false);
            }

            this._checkItemLength();
        }
    };


    App.prototype._setItemCompleted = function(id) {
        var ele = qs("[data-id='" + id + "']", this.$todoList),
            checkedToggle = qs(".toggle", ele),
            hash = getHash();

        if (ele) {
            checkedToggle.checked = true;
            ele.classList.add("completed");
            this._method.updateById.call(this, id, "status", "completed");
            this._updateLeftItemCount();

            if (hash === "active") {
                ele.style.display = "none";
            }
        }
    };

    App.prototype._setItemActive = function(id) {
        var ele = qs("[data-id='" + id + "']", this.$todoList),
            checkedToggle = qs(".toggle", ele),
            hash = getHash();

        if (ele) {
            checkedToggle.checked = false;

            ele.classList.remove("completed");
            this._method.updateById.call(this, id, "status", "active");
            this._updateLeftItemCount();

            if (hash === "completed") {
                ele.style.display = "none";
            }
        }
    };

    App.prototype._renderMore = function(arg_arr) {
        var cacheStr = "";
        for (var i = 0, len = arg_arr.length; i < len; i++) {
            cacheStr += createItemStr(arg_arr[i]);
        }

        this.$todoList.innerHTML = cacheStr;
        this._updateLeftItemCount();

    };

    App.prototype._filterItem = function(hash) {
        var filterArr,
            filtersBtns = qsa("li a", this.$filters);

        hash = hash ? hash : getHash();

        [].slice.call(filtersBtns).forEach(function(curBtn) {
            curBtn.classList.remove("selected");
        });

        if (hash === "active") {
            filterArr = this._filterData("active");
            filtersBtns[1].classList.add("selected");
        } else if (hash === "completed") {
            filterArr = this._filterData("completed");
            filtersBtns[2].classList.add("selected");
        } else { // all
            filterArr = this.data;
            filtersBtns[0].classList.add("selected");
        }

        this._renderMore(filterArr);
    };

    App.prototype._filterData = function(status) {
        var pendingArr = this.data,
            filterArr;
        filterArr = pendingArr.filter(function(curItem) {
            if (curItem.status === status) {
                return true;
            }
        });

        return filterArr;
    };

    App.prototype._toggleClearCompleted = function(isCompleted) {
        if (isCompleted === undefined) {
            isCompleted = this._method.hasCompleted.call(this);
        }

        var style = this.$clearCompleted.style;
        if (isCompleted) {
            style.display = "block";
        } else {
            style.display = "none";
        }
    };

    App.prototype._checkIsAllCompleted = function() {
        var isAllCompleted = this._method.isAllCompleted.call(this);
        if (isAllCompleted) {
            this.$toggleAll.checked = true;
        }
    };

    App.prototype._checkItemLength = function(){
        if(this.data.length === 0){
            this.$toggleAll.style.display = "none";
        }else{
            this.$toggleAll.style.display = "block";
        }
    };

    // methods set of processing data
    App.prototype._method = (function() {

        function _getIndexById(id, that) {
            for (var i = 0, len = that.data.length; i < len; i++) {
                if (that.data[i].id == id) {
                    return i;
                }
            }
        }

        function delById(id) {
            var index = _getIndexById(id, this);
            this.data.splice(index, 1);
            $localStorage.set("data", this.data);
        }

        function updateById(id, key, val) {
            var index = _getIndexById(id, this),
                item = this.data[index];

            item[key] = val;
            $localStorage.set("data", this.data);
        }

        function add(arg_obj) {
            this.data.push(arg_obj);
            $localStorage.set("data", this.data);
        }

        function setAllCompleted() {
            this.data.forEach(function(cData) {
                cData.status = "completed";
            });
            $localStorage.set("data", this.data);
        }

        function setAllActive() {
            this.data.forEach(function(cData) {
                cData.status = "active";
            });
            $localStorage.set("data", this.data);
        }

        function hasCompleted() {
            this.data.some(function(cData) {
                return cData.status === "completed";
            });
        }

        function isAllCompleted() {
            if(this.data.length === 0){
                return false;
            }
            return this.data.every(function(cData) {
                return cData.status === "completed";
            });
        }

        function isAllActive() {
            if(this.data.length === 0){
                return false;
            }
            return this.data.every(function(cData) {
                return cData.status === "active";
            });
        }


        return {
            delById: delById,
            updateById: updateById,
            add: add,
            setAllActive: setAllActive,
            setAllCompleted: setAllCompleted,
            hasCompleted: hasCompleted,
            isAllCompleted: isAllCompleted,
            isAllActive: isAllActive
        };
    })();


    // bind event
    App.prototype._bind = function() {
        var that = this;

        // press Enter to add newItem
        $event.addListener(that.$newTodo, "keypress", function(event) {
            var val = this.value.trim(),
                keyCode = event.keyCode;
            if (val === "") {
                return;
            }

            if (keyCode === that.ENTER_KEY) {
                that._addItemHandler({
                    id: Date.now(),
                    value: val
                });
            }
        });

        // blur to add newItem
        $event.addListener(that.$newTodo, "blur", function(event) {
            var val = this.value.trim();
            if (val === "") {
                return;
            }

            that._addItemHandler({
                id: Date.now(),
                value: val
            });

        });


        // toggle status : active or completed
        $event.delegate(that.$todoList, "li .toggle", "click", function(event) {
            // event.preventDefault();
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id");

            if (this.checked) {
                that._setItemCompleted(curId);
                that._checkIsAllCompleted();
            } else {
                that._setItemActive(curId);
                that.$toggleAll.checked = false;
            }
        });

        // delete item
        $event.delegate(that.$todoList, "li .destroy", "click", function(event) {
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id");

            that._removeItemHandler(curId);
        });

        // edit status
        $event.delegate(that.$todoList, "li label", "dblclick", function(event) {
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id");

            that._editStatus(curId);
        });

        // submit when press enter key
        $event.delegate(that.$todoList, "input.edit", "keydown", function(event) {
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id"),
                val = this.value.trim(),
                keyCode = event.keyCode;

            if (val === "") {
                that._removeItemHandler(curId);
                return;
            }
            if (keyCode === that.ENTER_KEY || keyCode === that.ESCAPE_KEY) {
                that._editDoneHandler({
                    id: curId,
                    value: val
                });
            }
        });

        // Double-click to edit
        $event.delegate(that.$todoList, "input.edit", "blur", function(event) {
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id"),
                val = this.value.trim(),
                keyCode = event.keyCode;

            if (val === "") {
                that._removeItemHandler(curId);
                return;
            }

            that._editDoneHandler({
                id: curId,
                value: val
            });
        }, true);

        // filter
        $event.addListener(window, "hashchange", function(event) {
            var hash = getHash();
            that._filterItem(hash);
        });


        // toggle-all
        $event.addListener(that.$toggleAll, "click", function(event) {
            var hash = getHash(),
                isAllCompleted;

            if (this.checked) {
                if (hash === "active") {
                    that._method.setAllCompleted.call(that);
                    that._renderMore([]);
                } else if (hash === "completed") {
                    that._method.setAllCompleted.call(that);
                    that._renderMore(that.data);
                } else {
                    [].slice.call(that.$todoList.children).forEach(function(item) {
                        that._setItemCompleted(item.getAttribute("data-id"));
                    });
                }
            } else {
                if (hash === "active") {
                    that._method.setAllActive.call(that);
                    that._renderMore(that.data);
                } else if (hash === "completed") {
                    that._method.setAllActive.call(that);
                    that._renderMore([]);
                } else {
                    [].slice.call(that.$todoList.children).forEach(function(item) {
                        that._setItemActive(item.getAttribute("data-id"));
                    });
                }
            }

            that._checkIsAllCompleted();
        });

        // clear completed item
        $event.addListener(that.$clearCompleted, "click", function(event) {

            for (var i = 0; i < that.data.length; i++) {
                var cData = that.data[i];
                if (cData.status === "completed") {
                    that._removeItemHandler(cData.id);
                    i--;
                }
            }
        });
    };

    // item template
    function createItemStr(arg_obj) {

        var statusObj = {};
        if (arg_obj.status === "completed") {
            statusObj = {
                className: "completed",
                checked: "checked"
            };
        }

        return '<li data-id="' + arg_obj.id + '" class="' + (statusObj.className || "") + '">' +
            '<div class="view">' +
            '<input class="toggle" type="checkbox" ' + (statusObj.checked || "") + '>' +
            '<label>' + arg_obj.value + '</label>' +
            '<button class="destroy"></button>' +
            '</div>' +
            '</li>';
    }

    function createItem(arg_obj) {
        var tempParent = document.createElement("div");
        var itemStr = createItemStr(arg_obj);
        tempParent.innerHTML = itemStr;

        return tempParent.children[0];
    }

    function getHash() {
        return window.location.hash.replace(/^#\//, "");
    }

    window.App = App;

})(window, LIB);
