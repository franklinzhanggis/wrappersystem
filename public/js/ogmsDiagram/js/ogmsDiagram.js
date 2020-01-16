//! Date : Zhang 2018-8-1
//! Author : Fengyuan(Franklin) 
//! Description : Library for Diagram Model
function OGMSDiagram(){
    this.inited = false;
    this.enabled = true;        //! editable
    this.states = [];           //! All states
    this.links = [];            //! All transition
    this.dataRef = [];          //! All data reference
    this.state_s = null;        //! Selected state
    this.event_s = null;        //! Selected event
    this.graph = null;          //! Graph panel
    this.stateInfoWin = null;   //! State window
    this.dataSchameWin = null;  //! Data Schame Reference window
    this.index = 1;             //! State index
    this.eventIndex = 1;        //! Event index
    this.events_tmp = null;     //! current event group
    this.vertexStyle = 'shape=ellipse;strokeWidth=2;fillColor=#ffffff;strokeColor=#0099CC;gradientColor=#0099CC;fontColor=black;fontStyle=1;spacingTop=14;';
    this.vertexStyle_running = 'shape=ellipse;strokeWidth=2;fillColor=#ffffff;strokeColor=#33CC00;gradientColor=#33CC00;fontColor=black;fontStyle=1;spacingTop=14;';
    this.vertexStyle_finished = 'shape=ellipse;strokeWidth=2;fillColor=#ffffff;strokeColor=#336699;gradientColor=#336699;fontColor=black;fontStyle=1;spacingTop=14;';
    this.edgeStyle = 'strokeWidth=3;endArrow=block;endSize=2;endFill=1;strokeColor=black;rounded=1;';

    this.stateDbCilck = null;
    this.debugFunction = null;
}

//! Initialization, need a div HTML tag
OGMSDiagram.prototype.init = function(container, opts, stateInfo, dataRefInfo, imgStatePath, imgGridPath, imgConnectPath, debug, debugFunction){
    if (!mxClient.isBrowserSupported()){
        mxUtils.error('Browser is not supported!', 200, false);
        return;
    }

    if(this.inited){
        return;
    }
    this.inited = true;

    if(debugFunction != undefined && debugFunction != null){
        this.debugFunction = debugFunction;
    }
    console.log(
        "                   _ooOoo_\n                  o8888888o\n                  88\" . \"88\n                  (| -_- |)\n                  O\\  =  /O\n               ____/`---'\\____\n             .'  \\\\|     |//  `.\n            /  \\\\|||  :  |||//  \\\n           /  _||||| -:- |||||-  \\\n           |   | \\\\\\  -  /// |   |\n           | \\_|  ''\\---/''  |   |\n           \\  .-\\__  `-`  ___/-. /\n         ___`. .'  /--.--\\  `. . __\n      .\"\" '<  `.___\\_<|>_/___.'  >'\"\".\n     | | :  `- \\`.;`\\ _ /`;.`/ - ` : | |\n     \\  \\ `-.   \\_ __\\ /__ _/   .-` /  /\n======`-.____`-.___\\_____/___.-`____.-'======\n                   `=---='\n^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n         Buddha Bless       No Bug"
    );

    this.enabled = opts.enabled;
    mxConnectionHandler.prototype.connectImage = new mxImage(imgConnectPath, 16, 16);

    var debugBtn = '';
    if(debug){
        debugBtn = '<input id="btTest" type="button" value="test" />';
    }
    
    var imgState = '';
    if(opts.enabled){
        imgState = '<img id="ogmsImgState" src="' + imgStatePath + '" width="100px" height="70px" />';
    }

    var enable = '';
    var stateButtons = '';
    var dataButtons = '';
    var eventAddButton = '';
    if(!this.enabled){
        enable = 'disabled';
        eventAddButton = 'style="display:none"';
    }
    else{
        stateButtons = '<br /><input id="stateSave"  class="btn btn-primary btn-lg" type="button" value="Save" />&nbsp;&nbsp;&nbsp;&nbsp;';
        dataButtons = '<input id="schameSave"  class="btn btn-primary btn-lg" type="button" value="Save" />&nbsp;&nbsp;&nbsp;' ;
    }

    container.append('<div id="ogmsGraphContainer" style="overflow:hidden;width:' + opts.width + 'px;height:' + opts.height + 'px;background:url(\'' + imgGridPath + '\')">' + 
                '</div>' + 
                imgState + 
                debugBtn + 
                '<div id="ogmsStateContent">' + 
                    '<br />' + 
                    '<form class="form-horizontal">' + 
                        '<div class="form-group mxWinPanel">' + 
                            '<label for="stateId" class="col-sm-3 control-label">ID</label>' + 
                            '<div class="col-sm-8">' + 
                            '<input type="text" class="form-control" ' + enable + ' id="stateId" placeholder="ID" />' + 
                            '</div>' + 
                        '</div>' + 
                        '<div class="form-group mxWinPanel">' + 
                            '<label for="stateName" class="col-sm-3 control-label">Name</label>' + 
                            '<div class="col-sm-8">' + 
                                '<input type="text" class="form-control" ' + enable + ' id="stateName" placeholder="Name" />' + 
                            '</div>' + 
                        '</div>' + 
                        '<div class="form-group mxWinPanel">' + 
                            '<label for="stateType" class="col-sm-3 control-label">Type</label>' + 
                            '<div class="col-sm-8">' + 
                                '<select id="stateType" ' + enable + ' class="form-control">' + 
                                    '<option value="basic" >basic</option>' + 
                                '</select>' + 
                            '</div>' + 
                        '</div>' + 
                        '<div class="form-group mxWinPanel">' + 
                            '<label for="stateDes" class="col-sm-3 control-label">Description</label>' + 
                            '<div class="col-sm-8">' + 
                                '<textarea id="stateDes" ' + enable + ' class="form-control" rows="3"></textarea>' + 
                            '</div>' + 
                        '</div>' + 
                    '</form>' + 
                    '<div>' + 
                    '<ul id="eventTabHead" class="nav nav-tabs" role="tablist">' + 
                    '<li role="presentation" id="eventItemAdd" ><a id="enentAdd" href="#add" ' + eventAddButton + ' aria-controls="add" role="tab" ><i class="fa fa-plus"></i></a></li>' + 
                    ' </ul>' + 
                    '<div id="eventTabContent" class="tab-content">' + 
                    '</div>' + 
                    '</div>' + 
                    '<div style="text-align: center">' + 
                    stateButtons + 
                    '<input id="stateCancel"  class="btn btn-warning btn-lg" type="button" value="Cancel" />' + 
                    '</div>' + 
                    '</div>' + 
                    '<div id="ogmsDataSchame">' + 
                    '<br />' + 
                    '<form class="form-horizontal">' + 
                    '<div class="form-group mxWinPanel">' + 
                    '<label for="schameName" class="col-sm-3 control-label">Name</label>' + 
                    '<div class="col-sm-8">' + 
                    '<input type="text" class="form-control" ' + enable + ' id="schameName" placeholder="Name" />' + 
                    '</div>' + 
                    '</div>' + 
                    '<div class="form-group mxWinPanel">' + 
                    '<label for="schameType" class="col-sm-3 control-label">Type</label>' + 
                    '<div class="col-sm-8">' + 
                    '<select id="schameType" class="form-control" ' + enable + '>' + 
                    '<option value="internal" >internal</option>' + 
                    '<option value="external" >external</option>' + 
                    '</select>' + 
                    '</div>' + 
                    '</div>' + 
                    '<div class="form-group mxWinPanel">' + 
                    ' <label for="schameDes" class="col-sm-3 control-label">Description</label>' + 
                    '<div class="col-sm-8">' + 
                    '<textarea id="schameDes" class="form-control" ' + enable + ' rows="3"></textarea>' + 
                    '</div>' + 
                    '</div>' + 
                    '<div class="form-group mxWinPanel">' + 
                    '<label for="schameValue" id="schameValueLabel" class="col-sm-3 control-label">Schame</label>' + 
                    '<div class="col-sm-8">' + 
                    '<textarea id="schameValue" class="form-control" ' + enable + ' rows="3"></textarea>' + 
                    '</div>' + 
                    '</div>' + 
                    '</form>' + 
                    '<div style="text-align: center">' + 
                    dataButtons + 
                    '<input id="schameCancel"  class="btn btn-warning btn-lg" type="button" value="Cancel" />' + 
                    '</div>' + 
                    '</div>');
    
    var graphContainer = document.getElementById('ogmsGraphContainer');

    //! Create graph
    this.graph = new mxGraph(graphContainer);
    
    //! Enabled edit
    this.graph.setEnabled(opts.enabled);
    //! Panning in right mouse
    this.graph.setPanning(true);
    //! Enabled Connectable
    this.graph.setConnectable(true);
    //! disabled Connectable
    this.graph.setCellsResizable(false);
    this.graph.setCellsDisconnectable(false);
    this.graph.swimlaneNesting = false;
    this.graph.dropEnabled = true;
    this.graph.setAllowDanglingEdges(false);
    this.graph.setMultigraph(false);
    this.graph.setAllowLoops(true);
    this.graph.setTolerance(20);


    var content = document.getElementById('ogmsStateContent');
    if(content != undefined && content != null){
        if (stateInfo != false){
            this.stateInfoWin = new mxWindow('State Inforamtion', content, stateInfo.x, stateInfo.y, 
            stateInfo.width, stateInfo.height, false, true);
            this.stateInfoWin.setScrollable(true);
            this.stateInfoWin.setResizable(true);
            this.stateInfoWin.setVisible(true);
            this.stateInfoWin.hide();
        }
        else{
            content.remove();
        }
    }
    
    var schame = document.getElementById('ogmsDataSchame');
    if(schame != undefined && content != null){
        if (dataRefInfo != false){
            this.dataSchameWin = new mxWindow('Data Reference', schame, dataRefInfo.x, dataRefInfo.y, 
            dataRefInfo.width, dataRefInfo.height, false, true);
            this.dataSchameWin.setScrollable(true);
            this.dataSchameWin.setResizable(true);
            this.dataSchameWin.setVisible(true);
            this.dataSchameWin.hide();
        }
        else{
            schame.remove();
        }
    }

    var parent = this.graph.getDefaultParent();
    
    //! Keydown
    mxEvent.addListener(document, 'keydown', function(evt){
        //! delete
        if (evt.keyCode == 46){
            var cells = this.graph.getSelectionCells();
            this.graph.removeCells(cells);
        }
    }.bind(this));

    //! Double Click
    mxGraph.prototype.dblClick = function(evt, cell){
        if (this.stateInfoWin == null){
            return;
        }
        if (cell != null){
            if (this.graph.model.isVertex(cell)){
                this.stateInfoWin.setLocation(500, $('#ogmsGraphContainer').offset().top);
                //! Double Click in Vertex
                this.stateInfoWin.show();

                //! Load selected cell
                this.state_s = cell;
                $('#stateId').val(cell.state.id);
                $('#stateName').val(cell.state.name);
                $('#stateType').val(cell.state.type);
                $('#stateDes').val(cell.state.description);

                //! Remove all event
                this.removeAllEventPanels();

                //! Load temp event
                this.events_tmp = JSON.parse(JSON.stringify(cell.state.events));

                //! Load event panels
                this.loadEventPanels(this.events_tmp);

                //! Data Reference Window hide
                this.dataSchameWin.hide();

                //! Custom Event
                if(this.stateDbCilck != undefined && this.stateDbCilck != null){
                    this.stateDbCilck(this.state_s.state);
                }
            }
            else{
                // Double Click in Edge
            }
        }
        else{
            // Double Click in Panel
            this.stateInfoWin.hide();
        }
    }.bind(this);

    //! Click
    mxGraph.prototype.click = function(evt, cell){
        if (cell == null){
            // this.stateInfoWin.hide();
        }
    }.bind(this);

    //! Add a cell (State or Transition)
    this.graph.addListener(mxEvent.ADD_CELLS, function(sender, evt){
        var cells = evt.getProperty('cells');
        for (var i = 0; i < cells.length; i++){
            var cell = cells[i];
            if (this.graph.model.isEdge(cell)){
                this.links.push({
                    from : cell.source.state.id,
                    to : cell.target.state.id
                });
                cell.style = this.edgeStyle;
                cell.from = cell.source.state.id;
                cell.to = cell.target.state.id;
            }
            if (this.graph.model.isVertex(cell)){
            }
        }
    }.bind(this));
    
    //! Remove a cell (State or Transition)
    this.graph.addListener(mxEvent.REMOVE_CELLS, function(sender, evt){
        var cells = evt.getProperty('cells');
        for (var i = 0; i < cells.length; i++){
            var cell = cells[i];
            if (this.graph.model.isEdge(cell)){
                for(var j = 0; j < this.links.length; j++){
                    if(this.links[j].from == cell.from && this.links[j].to == cell.to){
                        this.links.splice(j, 1);
                    }
                }
            }
            if (this.graph.model.isVertex(cell)){
                for(var j = 0; j < this.states.length; j++){
                    if (this.states[j].state.id == cell.state.id){
                        this.states.splice(j, 1);
                    }
                }
            }
        }
    }.bind(this));

    ///////! Drag add state start
    if(opts.enabled){
        var graphF = function(evt){
            
            return this.graph;
        }.bind(this);
        
        var insertCell = function(graph, evt, target, x, y){
            var v_cell = graph.insertVertex(parent, null, 'State' + this.index, x, y, 100, 50, this.vertexStyle);
            var state = {
                id : OGMSDiagram.uuid(),
                name : 'State' + this.index,
                type : "basic",
                description : "",
                events : []
            };
            v_cell['state'] = state;
            this.states.push(v_cell);
            this.index ++;
        }.bind(this);
    
        var img = document.getElementById('ogmsImgState');
    
        var ds = mxUtils.makeDraggable(img, graphF, insertCell, img, null, null, this.graph.autoscroll, true);
        ds.isGuidesEnabled = function(){
            return this.graph.graphHandler.guidesEnabled;
        }.bind(this);
        
        ds.createDragElement = mxDragSource.prototype.createDragElement;
    }
    
    ///////! Drag add state end
    
    //! Save button
    $('#stateSave').click(function(e){
        if(this.state_s != null){
            this.state_s.state.id = $('#stateId').val();
            this.state_s.state.name = $('#stateName').val();
            this.state_s.state.type = $('#stateType').val();
            this.state_s.state.description = $('#stateDes').val();
            var stateName = $('#stateName').val();
            if (stateName.length > 15){
                this.state_s.value = stateName.substr(0, 15) + '...';
            }
            else {
                this.state_s.value = stateName;
            }
            this.state_s.state.events = JSON.parse(JSON.stringify(this.events_tmp));
            for(var i = 0; i < this.events_tmp.length; i++){
                var id = this.state_s.state.events[i].id
                if($('#eventName_' + id).val().trim() != ''){
                    this.state_s.state.events[i].name = $('#eventName_' + id).val();
                }
                this.state_s.state.events[i].type = $('#eventType_' + id).val();
                this.state_s.state.events[i].option = $('#eventOptional_' + id).val();
                this.state_s.state.events[i].description = $('#eventDes_' + id).val();
                $('#eventHeadName_' + id).html(this.state_s.state.events[i].name);
            }
            this.graph.refresh(this.state_s);
            this.stateInfoWin.hide();
        }
    }.bind(this));

    //! Cancel button
    $('#stateCancel').click(function(e){
        this.stateInfoWin.hide();
    }.bind(this));

    //! Event Dialog Add
    var eventIndex = 0;
    $('#enentAdd').click(function (e) {
        eventIndex++;
        this.addEvent(eventIndex, 'NewEvent' + eventIndex);
    }.bind(this));

    $('#schameType').change(function(e){
        if($(e.currentTarget).val() == 'internal'){
            $('#schameValueLabel').html('Schame');
        }
        else if($(e.currentTarget).val() == 'external'){
            $('#schameValueLabel').html('ExternalId');
        }
    }.bind(this));

    //! Data Reference Save
    $('#schameSave').click(function(e) {
        var name = $('#schameName').val();
        var type = $('#schameType').val();
        var des = $('#schameDes').val();
        var value = $('#schameValue').val();
        var i;
        for(i = 0; i < this.dataRef.length; i++){
            if(name == this.dataRef[i].name){
                break;
            }
        }
        if(i == this.dataRef.length){
            this.dataRef.push({
                name : name,
                type : type,
                description : des,
                value : value
            });
        } 
        this.event_s.dataDes = name;
        $('#dataTemplate_' + this.event_s.id).html(name);
        $('#dataTemplate_' + this.event_s.id).addClass('badge-success');
        $('#dataTemplate_' + this.event_s.id).removeClass('badge-default');
        this.dataSchameWin.hide();
    }.bind(this));
    
    //! Data Reference Cancel
    $('#schameCancel').click(function(e) {
        this.dataSchameWin.hide();
    }.bind(this));
    
    //! Test button
    if(debug){
        $('#btTest').click(function(e){
            if(this.debugFunction != null){
                this.debugFunction(this);
            }
        }.bind(this));
    }
}

OGMSDiagram.prototype.addEvent = function(id, name, type, option, description, dataDes){
    if(id == null){
        id = OGMSDiagram.uuid();
    }
    if(name == null){
        name = 'NewEvent' + OGMSDiagram.uuid().substr(0, 5);
    }
    if(type == null){
        type = 'responese';
    }
    if(option == null){
        option = 'False';
    }
    if(description == null){
        description = '';
    }
    if(dataDes == null){
        dataDes = '[Undefined]';
    }
    this.events_tmp.push({
        id : id,
        name : name,
        type : type,
        option : option,
        description : description,
        dataDes, dataDes
    });
    this.addEventPanel(id, name, type, option, description, dataDes);
}

OGMSDiagram.prototype.addEventPanel = function(id, name, type, option, description, dataDes){
    if(id == null){
        id = OGMSDiagram.uuid();
    }
    if(name == null){
        name = 'NewEvent' + OGMSDiagram.uuid().substr(0, 5);
    }
    if(type == null){
        type = 'responese';
    }
    if(option == null){
        option = 'False';
    }
    if(description == null){
        description = '';
    }
    if(dataDes == null){
        dataDes = '[Undefined]';
    }

    var enable = '';
    var dataConfigButton = '';
    var eventCloseButton = '';
    if(!this.enabled){
        enable = 'disabled';
    }
    else{
        eventCloseButton = '<button id="eventDelete_' + id + '" type="button" class="close close-sm" data-dismiss="alert" data-tag="' + id + '">' + 
        '<i class="fa fa-times"></i>' +
    '</button>';
        dataConfigButton = '<input id="dataInput_' + id + '" class="btn btn-default btn-lg" type="button" value="Configure" data-tag="' + id + '" />';
    }
    $('<li id="eventHead_' + id + '" role="presentation">' +
        '<a href="#event_' + id + '" aria-controls="event_' + id + '" role="tab" data-toggle="tab">' + 
            '<i class="fa fa-flash"></i><span id="eventHeadName_' + id + '" >' + name + '</span>' + 
            eventCloseButton +
        '</a>' + 
    '</li>').insertBefore($('#eventItemAdd'));
    var spanDataDes = '';
    if(dataDes == '[Undefined]'){
        spanDataDes = '<span class="badge badge-default" id="dataTemplate_' + id + '" data-tag="' + id + '">' + dataDes + '</span>';
    }
    else {
        spanDataDes = '<span class="badge badge-info" style="cursor:pointer" id="dataTemplate_' + id + '" data-tag="' + id + '">' + dataDes + '</span>';
    }
    $('#eventTabContent').append('<div role="tabpanel" class="tab-pane" id="event_' + id + '">' + 
            '<form class="form-horizontal">' + 
                '<div class="form-group mxWinPanel">' + 
                    '<label for="eventName" class="col-sm-3 control-label">Name</label>' + 
                    '<div class="col-sm-8">' + 
                    '<input type="text" class="form-control" ' + enable + ' id="eventName_' + id + '" value="' + name + '" placeholder="Event Name" />' + 
                    '</div>' + 
                '</div>' + 
                '<div class="form-group mxWinPanel">' + 
                    '<label for="eventType_' + id + '" class="col-sm-3 control-label">Type</label>' + 
                    '<div class="col-sm-8">' + 
                        '<select id="eventType_' + id + '" class="form-control" ' + enable + '>' + 
                            '<option value="response" >response(input)</option>' + 
                            '<option value="noresponse" >noresponse(output)</option>' + 
                        '</select>' + 
                    '</div>' + 
                '</div>' + 
                '<div class="form-group mxWinPanel">' + 
                    '<label for="eventOptional_' + id + '" class="col-sm-3 control-label">Optional</label>' + 
                    '<div class="col-sm-8">' + 
                        '<select id="eventOptional_' + id + '" class="form-control" ' + enable + '>' + 
                            '<option value="False" >False</option>' + 
                            '<option value="True" >True</option>' + 
                        '</select>' + 
                    '</div>' + 
                '</div>' + 
                '<div class="form-group mxWinPanel">' + 
                    '<label for="eventDes_' + id + '" class="col-sm-3 control-label">Description</label>' + 
                    '<div class="col-sm-8">' + 
                        '<textarea id="eventDes_' + id + '" class="form-control" ' + enable + ' rows="3">' + description + '</textarea>' + 
                    '</div>' + 
                '</div>' + 
                '<div class="form-group mxWinPanel">' + 
                    '<label for="dataDescription" class="col-sm-3 control-label">Dataset Reference</label>' + 
                    '<div class="col-sm-3">' + 
                    spanDataDes + 
                    '</div>' + 
                    '<div class="col-sm-2">' + 
                    dataConfigButton + 
                    '</div>' + 
                '</div>' + 
            '</form>' + 
        '</div>');
        $('#eventType_' + id + ' option[value="' + type + '"]').attr('selected','selected');
        $('#eventOptional_' + id + ' option[value="' + option + '"]').attr('selected','selected');
        
        if(this.enabled){
            $('#dataInput_' + id).click(function(e){
                this.dataSchameWin.show();
                this.event_s = this.getEventByE(e);
                if(this.event_s.dataDes != '[Undefined]'){
                    for (var i = 0; i < this.dataRef.length; i++){
                        if(this.dataRef[i].name == this.event_s.dataDes){
                            this.loadDataReference(this.dataRef[i].name, this.dataRef[i].type, this.dataRef[i].description, this.dataRef[i].value);
                            break;
                        }
                    }
                }
                else{
                    this.loadDataReference('', 'internal', '', ''); 
                }
            }.bind(this));
            
            $('#eventDelete_' + id).click(function(e){
                var id = $(e.currentTarget).attr('data-tag');
                this.removeEvent(id);
            }.bind(this));
        }
        else{
            $('#dataTemplate_' + id).click(function(e){
                this.event_s = this.getEventByE(e);
                if(this.event_s.dataDes != '[Undefined]'){
                    for (var i = 0; i < this.dataRef.length; i++){
                        if(this.dataRef[i].name == this.event_s.dataDes){
                            this.loadDataReference(this.dataRef[i].name, this.dataRef[i].type, this.dataRef[i].description, this.dataRef[i].value);
                            this.dataSchameWin.setLocation(1000, $('#ogmsGraphContainer').offset().top);
                            this.dataSchameWin.show();
                            break;
                        }
                    }
                }
            }.bind(this));
        }
        
}

OGMSDiagram.prototype.getEventByE = function(e){
    var id = $(e.currentTarget).attr('data-tag');
    return this.getEventById(id);
}

OGMSDiagram.prototype.getEventById = function(id){
    for(var i = 0; i < this.events_tmp.length; i++){
        if(this.events_tmp[i].id == id){
            return this.events_tmp[i];
        }
    }
}

OGMSDiagram.prototype.removeEvent = function(id){
    for(var i = 0; i < this.events_tmp.length; i++){
        if(this.events_tmp[i].id == id){
            this.events_tmp.splice(i, 1);
            this.removeEventPanel(id);
            break;
        }
    }
    this.removeEventPanel(id);
}

OGMSDiagram.prototype.removeEventPanel = function(id){
    $('#eventHead_' + id).remove();
    $('#event_' + id).remove();
}

OGMSDiagram.prototype.removeAllEventPanels = function(){
    $('#eventTabContent').html(''); 
    $('#eventItemAdd').siblings().remove();
}

OGMSDiagram.prototype.loadEventPanels = function(events){
    for(var i = 0; i < events.length; i++){
        this.addEventPanel(events[i].id, events[i].name, events[i].type, events[i].option, events[i].description, events[i].dataDes);
    }
}

OGMSDiagram.prototype.loadDataReference = function(name, type, description, schame){
    $('#schameName').val(name);
    $('#schameType').val(type);
    $('#schameDes').val(description);
    $('#schameValue').val(schame);
}

//! Get Source 
OGMSDiagram.prototype.getSource = function(stateId){
    var sources = [];
    this.markStateById(stateId);
    for(var i = 0; i < this.links.length; i++){
        if(this.links[i].to == stateId){
            var j;
            for(j = 0; j < sources.length; j++){
                if(sources[j] == this.links[i].from){
                    break;
                }
            }
            if(j == sources.length){
                sources.push(this.links[i].from)
            }
        }
    }
    var tmpSources = [];
    for(var j = 0; j < sources.length; j++){
        var ss = this.getSource(sources[j]);
        if(ss.length != 0){
            tmpSources = tmpSources.concat(ss);
        }
    }
    sources = tmpSources;
    if(sources.length == 0){
        return [stateId];
    }
    return sources;
}

//! Get Next Layer
OGMSDiagram.prototype.getNextLayer = function(sources){
    var ends = [];
    for(var j = 0; j < sources.length; j++){
        for(var i = 0; i < this.links.length; i++){
            if(this.links[i].from == sources[j]){
                ends = OGMSDiagram.mergeArray(ends, [this.links[i].to]);
            }
        }
    }
    return ends;
}

//! Move State !!! No fresh
OGMSDiagram.prototype.moveState = function(stateId, x, y){
    var state = this.getModelStateByID(stateId);
    state.geometry.setRect(x, y, 100, 50);
}

//! Mark State
OGMSDiagram.prototype.markStateById = function(stateId){
    for(var i = 0; i < this.states.length; i++){
        if(this.states[i].state.id == stateId){
            this.states[i]['marked'] = true;
        }
    }
}

//////// Public Method

//! Format to json string 
OGMSDiagram.prototype.format2JSON = function(){
    var behaviors = {
        states : [],
        transition : [],
        dataRef : []
    };
    for(var i = 0; i < this.states.length; i++){
        var state = {};
        state['id'] = this.states[i].state.id;
        state['name'] = this.states[i].state.name;
        state['type'] = this.states[i].state.type;
        state['description'] = this.states[i].state.description;
        state['events'] = this.states[i].state.events;
        behaviors.states.push(state);
    }
    for(var i = 0; i < this.links.length; i++){
        var link = {};
        link['from'] = this.links[i].from;
        link['to'] = this.links[i].to;
        behaviors.transition.push(link);
    }
    for(var i = 0; i < this.dataRef.length; i++){
        var df = {};
        df['name'] = this.dataRef[i].name;
        df['type'] = this.dataRef[i].type;
        df['description'] = this.dataRef[i].description;
        df['value'] = this.dataRef[i].value;
        behaviors.dataRef.push(df);
    }
    return JSON.stringify(behaviors);
}

//! Load json string
OGMSDiagram.prototype.loadJSON = function(strjson){
    this.graph.removeCells(this.graph.getChildVertices(this.graph.getDefaultParent()));
    jsBahavior = JSON.parse(strjson);
    var parent = this.graph.getDefaultParent();
    for (var i = 0; i < jsBahavior.states.length; i++){
        var displayName = jsBahavior.states[i].name;
        if (displayName.length > 15){
            displayName = displayName.substr(0, 15) + '...';
        }
        var v_cell = this.graph.insertVertex(parent, null, displayName, 20 + i*120, 20, 100, 50, this.vertexStyle);
        v_cell['state'] = {
            id : jsBahavior.states[i].id,
            name : jsBahavior.states[i].name,
            type : jsBahavior.states[i].type,
            description : jsBahavior.states[i].description,
            events : jsBahavior.states[i].events
        }
        this.states.push(v_cell);
    }
    if (jsBahavior.transition.length == 0 && jsBahavior.states.length > 1){
        var trans = jsBahavior.states.length - 1;
        for (var i = 0; i < trans; i++){
            this.graph.insertEdge(parent, null, '', this.states[i], this.states[i + 1]);
            this.links.push({
                from : this.states[i].id,
                to : this.states[i + 1].id
            });
        }
    }
    else{
        for (var i = 0; i < jsBahavior.transition.length; i++){
            this.graph.insertEdge(parent, null, '', this.getModelStateByID(jsBahavior.transition[i].from), this.getModelStateByID(jsBahavior.transition[i].to));
            this.links.push({
                from : jsBahavior.transition[i].from,
                to : jsBahavior.transition[i].to
            });
        }
    }
    for (var i = 0; i < jsBahavior.dataRef.length; i++){
        this.dataRef.push({
            name : jsBahavior.dataRef[i].name,
            type : jsBahavior.dataRef[i].type,
            description : jsBahavior.dataRef[i].description,
            value : jsBahavior.dataRef[i].value
        });
    }
    this.orderGraphs();
}

//! Order graphs
OGMSDiagram.prototype.orderGraphs = function(){
    for(var i = 0; i < this.states.length; i++){
        this.states[i]['marked'] = false;
    }
    var sources = [];
    for(var i = 0; i < this.states.length; i++){
        var ss = [];
        if(!this.states[i].marked){
            ss = this.getSource(this.states[i].state.id);
        }
        sources = OGMSDiagram.mergeArray(sources, ss);
    }
    for(var i = 0; i < sources.length; i++){
        this.moveState(sources[i], 50, (i*80 + 60));
    }
    var layer2 = this.getNextLayer(sources);
    var xIndex = 1;
    while(layer2.length != 0){
        for(var i = 0; i < layer2.length; i++){
            this.moveState(layer2[i], 50 + xIndex*150, (i*80 + 60));
        }
        xIndex++;
        var layer2 = this.getNextLayer(layer2);
    }
    this.graph.refresh();
}

//! Show State Window
OGMSDiagram.prototype.showStateWin = function(position, size){
    if(position != undefined && position != null){
        this.stateInfoWin.setLocation(position.x, position.y);
    }
    if(size != undefined && size != null){
        this.stateInfoWin.setSize(size.width, size.height);
    }
    this.stateInfoWin.show();
}

//! Show Data Reference Window
OGMSDiagram.prototype.closeStateWin = function(){
    this.stateInfoWin.hide();
}

//! Show Data Reference Window
OGMSDiagram.prototype.showDataRefWin = function(position, size){
    if(position != undefined && position != null){
        this.dataSchameWin.setLocation(position.x, position.y);
    }
    if(size != undefined && size != null){
        this.dataSchameWin.setSize(size.width, size.height);
    }
    this.dataSchameWin.show();
}

//! Show Data Reference Window
OGMSDiagram.prototype.closeDataRefWin = function(){
    this.dataSchameWin.hide();
}

//! Get state by ID
OGMSDiagram.prototype.getModelStateByID = function(id){
    for(var i = 0; i < this.states.length; i++){
        if(this.states[i].state.id == id){
            return this.states[i];
        }
    }
}

//! Get state by Name
OGMSDiagram.prototype.getModelStateByName = function(name){
    for(var i = 0; i < this.states.length; i++){
        if(this.states[i].state.name == name){
            return this.states[i];
        }
    }
}

//! Set State as Default
OGMSDiagram.prototype.setStateAsDefault = function(state){
    var curr_state = null;
    if(OGMSDiagram.isGUID(state)){
        curr_state = this.getModelStateByID(state);
    }
    else{
        curr_state = this.getModelStateByName(state);
    }
    if(curr_state != null){
        curr_state.style = this.vertexStyle;
        this.graph.refresh(curr_state);
    }
}

//! Set State as Running
OGMSDiagram.prototype.setStateAsRunning = function(state){
    var curr_state = null;
    if(OGMSDiagram.isGUID(state)){
        curr_state = this.getModelStateByID(state);
    }
    else{
        curr_state = this.getModelStateByName(state);
    }
    if(curr_state != null){
        curr_state.style = this.vertexStyle_running;
        this.graph.refresh(curr_state);
    }
}

//! Set State as Finished
OGMSDiagram.prototype.setStateAsFinished = function(state){
    var curr_state = null;
    if(OGMSDiagram.isGUID(state)){
        curr_state = this.getModelStateByID(state);
    }
    else{
        curr_state = this.getModelStateByName(state);
    }
    if(curr_state != null){
        curr_state.style = this.vertexStyle_finished;
        this.graph.refresh(curr_state);
    }
}

///////////////////////////// Event

//! on state double click
OGMSDiagram.prototype.onStatedbClick = function(callback){
    this.stateDbCilck = callback;
}

///////////////////////////// Utils

// margin
OGMSDiagram.mergeArray = function(source, target){
    var source_t = source.slice(0);
    for(var i = 0; i < target.length; i++){
        var j;
        for(j = 0; j < source.length; j++){
            if(target[i] == source[j]){
                break;
            }
        }
        if(j == source.length){
            source_t.push(target[i]);
        }
    }
    return source_t;
}

//! generation for GUID
OGMSDiagram.uuid = function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

//! judgement for GUID
OGMSDiagram.isGUID = function(data) {
    if(data.length != 36){
        return false;
    }
    if(data.split('-').length != 5){
        return false;
    }
    return true;
}