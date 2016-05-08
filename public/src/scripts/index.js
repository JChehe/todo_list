var LIB = LIB || {};


;
(function(LIB) {
    var $dom = LIB.util.Dom,
        $event = LIB.util.Event;


    function app() {
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

        this.data = [{
            id: 1,
            value: "123",
            status: "active"
        }, {
            id: 2,
            value: "456",
            status: "completed"
        }, {
            id: 3,
            value: "789",
            status: "completed"
        }, {
            id: 4,
            value: "101",
            status: "completed"
        }, {
            id: 5,
            value: "102",
            status: "completed"
        }, {
            id: 6,
            value: "103",
            status: "completed"
        }]
    }

    app.prototype.init = function() {
        this._bind();
        this._filterItem(window.location.hash)
    }



    app.prototype._addItemHandler = function(arg_obj) {
        var newItem = createItem({
            id: arg_obj.id,
            value: arg_obj.val
        });

        this.$newTodo.value = "";

        this._method.add.call(this, newItem);

        this.$todoList.appendChild(newItem);
        this._updateLeftItemCount();

    }

    app.prototype._removeItemHandler = function(id) {
        var ele = qs("[data-id='" + id + "']");
        if (ele) {
            this.$todoList.removeChild(ele);

            this._method.delById.call(this, id);

            this._updateLeftItemCount();
        }
    }

    app.prototype._editStatus = function(id) {
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
    }

    app.prototype._editDoneHandler = function(arg_obj) {
        var ele = qs("[data-id='" + arg_obj.id + "']");

        if (ele) {
            var editInput = qs("input.edit", ele),
                label = qs("label", ele);

            label.innerHTML = arg_obj.value;
            ele.classList.remove('editing');
            $dom.remove(editInput);

        }
    }

    app.prototype._updateLeftItemCount = function() {
        var counter = 0;
        var ele = qs("strong", this.$todoItemCounter);

        if (ele) {
            this.data.forEach(function(cData) {
                if (cData.status === "active") {
                    counter++;
                }
            })
            ele.innerHTML = counter;

            if (counter < this.data.length) {
                this._toggleClearCompleted(true);
            } else {
                this._toggleClearCompleted(false);
            }
        }
    }


    app.prototype._setItemCompleted = function(id) {
        var ele = qs("[data-id='" + id + "']", this.$todoList),
            checkedToggle = qs(".toggle", ele),
            hash = window.location.hash.replace(/^#\//, "");

        if (ele) {
            checkedToggle.checked = true;
            ele.classList.add("completed");
            this._method.updateById.call(this, id, "status", "completed");
            this._updateLeftItemCount();


            if (hash === "active") {
                ele.style.display = "none"
            }
        }
    }

    app.prototype._setItemActive = function(id) {
        var ele = qs("[data-id='" + id + "']", this.$todoList),
            checkedToggle = qs(".toggle", ele),
            hash = window.location.hash.replace(/^#\//, "");

        if (ele) {
            checkedToggle.checked = false;

            ele.classList.remove("completed");
            this._method.updateById.call(this, id, "status", "active");
            this._updateLeftItemCount();

            if (hash === "completed") {
                ele.style.display = "none"
            }
        }
    }

    app.prototype._renderMore = function(arg_arr) {
        var cacheStr = ""
        for (var i = 0, len = arg_arr.length; i < len; i++) {
            cacheStr += createItemStr(arg_arr[i]);
        }

        this.$todoList.innerHTML = cacheStr;
        this._updateLeftItemCount();

    }

    app.prototype._filterItem = function(hash) {
        var filterArr,
            filtersBtns = qsa("li a", this.$filters);

        hash = hash ? hash.replace(/^#\//, "") : "";

        [].slice.call(filtersBtns).forEach(function(curBtn) {
            curBtn.classList.remove("selected");
        })

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

        this._renderMore(filterArr)
    }

    app.prototype._filterData = function(status) {
        var pendingArr = this.data,
            filterArr;
        filterArr = pendingArr.filter(function(curItem) {
            if (curItem.status === status) {
                return true;
            }
        });

        return filterArr;
    }

    app.prototype._toggleClearCompleted = function(isCompleted) {
        if (isCompleted == undefined) {
            isCompleted = this._method.hasCompleted.call(this)
        }

        var style = this.$clearCompleted.style;
        if (isCompleted) {
            style.display = "block";
        } else {
            style.display = "none";
        }
    }

    app.prototype._method = (function() {

        function _getIndexById(id, that) {
            for (var i = 0, len = that.data.length; i < len; i++) {
                if (that.data[i].id == id) {
                    return i;
                }
            }
        }

        function delById(id) {
            console.log(this)
            var index = _getIndexById(id, this);
            this.data.splice(index, 1);
        }

        function updateById(id, key, val) {
            console.log(this)
            var index = _getIndexById(id, this),
                item = this.data[index];

            console.log(item)
            item[key] = val;
        }

        function add(arg_obj) {
            console.log(this)
            this.data.push(arg_obj);
        }

        function setAllCompleted() {
            this.data.forEach(function(cData) {
                cData.status = "completed";
            })
        }

        function setAllActive() {
            this.data.forEach(function(cData) {
                cData.status = "active";
            })
        }

        function hasCompleted() {
            this.data.some(function(cData) {
                return cData.status === "completed"
            })
        }


        return {
            delById: delById,
            updateById: updateById,
            add: add,
            setAllActive: setAllActive,
            setAllCompleted: setAllCompleted,
            hasCompleted: hasCompleted
        }
    })();

    app.prototype._bind = function() {
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
                    val: val
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
                val: val
            });

        })


        // toggle status : active or completed
        $event.delegate(that.$todoList, "li .toggle", "click", function(event) {
            // event.preventDefault();
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id");

            if (this.checked) {
                that._setItemCompleted(curId)
            } else {
                that._setItemActive(curId)
            }
        });

        // delete item
        $event.delegate(that.$todoList, "li .destroy", "click", function(event) {
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id");

            that._removeItemHandler(curId);
            console.log(that.$todoList.children)
        });

        // edit status
        $event.delegate(that.$todoList, "li label", "dblclick", function(event) {
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id");

            that._editStatus(curId);
        });

        $event.delegate(that.$todoList, "input.edit", "keydown", function(event) {
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id"),
                val = this.value.trim(),
                keyCode = event.keyCode;

            if (val === "") {
                that._removeItemHandler(curId)
                return;
            }
            if (keyCode === that.ENTER_KEY || keyCode === that.ESCAPE_KEY) {
                that._editDoneHandler({
                    id: curId,
                    value: val
                });
            }
        });

        $event.delegate(that.$todoList, "input.edit", "blur", function(event) {
            var curItem = $dom.closest(this, "li"),
                curId = curItem.getAttribute("data-id"),
                val = this.value.trim(),
                keyCode = event.keyCode;

            if (val === "") {
                that._removeItemHandler(curId)
                return;
            }

            that._editDoneHandler({
                id: curId,
                value: val
            });
        }, true);

        // filter
        $event.addListener(window, "hashchange", function(event) {
            var hash = window.location.hash;
            that._filterItem(hash);

        });


        // toggle-all
        $event.addListener(that.$toggleAll, "click", function(event) {
            var hash = window.location.hash.replace(/^#\//, "");
            if (this.checked) {
                if (hash === "active") {
                    that._method.setAllCompleted.call(that);
                    that._renderMore([]);
                } else if (hash === "completed") {
                    that._method.setAllCompleted.call(that);
                    that._renderMore(that.data);
                } else {
                    [].slice.call(that.$todoList.children).forEach(function(item) {
                        that._setItemCompleted(item.getAttribute("data-id"))
                    })

                }
            } else {
                if (hash === "active") {
                    that._method.setAllActive.call(that);
                    that._renderMore(that.data)
                } else if (hash === "completed") {
                    that._method.setAllActive.call(that);
                    that._renderMore([]);
                } else {

                    [].slice.call(that.$todoList.children).forEach(function(item) {
                        that._setItemActive(item.getAttribute("data-id"))
                    })
                }
            }

        })

        $event.addListener(that.$clearCompleted, "click", function(event) {

            for(var i = 0; i < that.data.length; i++){
                var cData = that.data[i]
                if (cData.status === "completed") {
                    that._removeItemHandler(cData.id);
                    i--;
                }
            }
        })
    }

    function createItemStr(arg_obj) {

        var statusObj = {};
        if (arg_obj.status === "completed") {
            statusObj = {
                className: "completed",
                checked: "checked"
            }
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
        console.log(arg_obj)
        var itemStr = createItemStr(arg_obj);
        tempParent.innerHTML = itemStr;

        return tempParent.children[0];
    }



    (new app()).init()




})(LIB);
