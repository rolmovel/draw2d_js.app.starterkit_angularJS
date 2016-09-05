/* jshint evil:true */
app.controller('EditorController',[ '$scope', "$modal", function($scope,  $modal) {
	
    function setProperties(obj, flumeType) {
        console.log("Adding properties to " + obj.id + ". Using " + flumeType);
        var props;
        switch(flumeType){
            case "ExecSource":
                props = {
                    "type":"ExecSource",
                    "channels":"",
                    "command":"",
                    "shell":"",
                    "restartThrottle":"",
                    "restart":"",
                    "logStdErr":"",
                    "batchSize":"",
                    "batchTimeout":"",
                    "interceptors":""
                };
                obj.setUserData(props);
                obj.add(new draw2d.shape.basic.Label({text:"ExecSource"}), new draw2d.layout.locator.TopLocator());
                obj.setResizeable(false);
                break;
            case "AvroSource":
                props = {
                    "type":"AvroSource",
                    "channels":"",
                    "bind":"",
                    "port":"",
                    "threads":"",
                    "compression-type":"",
                    "ssl":"",
                    "keystore":"",
                    "keystore-password":"",
                    "keystore-type":"",
                    "exclude-protocols":"",
                    "ipFilter":"",
                    "ipFilterRules":""
                };
                obj.setUserData(props);
                obj.add(new draw2d.shape.basic.Label({text:"AvroSource"}), new draw2d.layout.locator.TopLocator());
                obj.setResizeable(false);
                break;
            case "MemoryChannel":
                props = {
                    "type":"MemoryChannel",
                    "capacity":"",
                    "transactionCapacity":"",
                    "keep-alive":"",
                    "byteCapacityBufferPercentage":"",
                    "byteCapacity":""
                };
                obj.setUserData(props);
                obj.add(new draw2d.shape.basic.Label({text:"MemoryChannel"}), new draw2d.layout.locator.TopLocator());
                obj.setResizeable(false);
                break;
            case "KafkaChannel":
                props = {
                    "type":"KafkaChannel",
                    "brokerList":"",
                    "zookeeperConnect":"",
                    "topic":"",
                    "groupId":"",
                    "parseAsFlumeEvent":"",
                    "readSmallestOffset":""
                };
                obj.setUserData(props);
                obj.add(new draw2d.shape.basic.Label({text:"KafkaChannel"}), new draw2d.layout.locator.TopLocator());
                obj.setResizeable(false);
                break;
            case "HDFSSink":
                props = {
                    "type":"HDFSSink",
                    "channel":"",
                    "hdfs.path":"",
                    "hdfs.filePrefix":"",
                    "hdfs.fileSuffix":"",
                    "hdfs.inUsePrefix":"",
                    "hdfs.inUseSuffix":"",
                    "hdfs.rollInterval":"",
                    "hdfs.rollSize":"",
                    "hdfs.rollCount":"",
                    "hdfs.idleTimeout":"",
                    "hdfs.batchSize":"",
                    "hdfs.codeC":""
                };
                obj.setUserData(props);
                obj.add(new draw2d.shape.basic.Label({text:"HDFSSink"}), new draw2d.layout.locator.TopLocator());
                obj.setResizeable(false);
                break;
 
            case "KafkaSink":
                props = {
                    "type":"KafkaSink",
                    "brokerList":"",
                    "zookeeperConnect":"",
                    "topic":"",
                    "groupId":"",
                    "parseAsFlumeEvent":"",
                    "readSmallestOffset":""
                };
                obj.setUserData(props);
                obj.add(new draw2d.shape.basic.Label({text:"KafkaSink"}), new draw2d.layout.locator.TopLocator());
                obj.setResizeable(false);
                break;
       }
        
        console.log("Props added");
    }


    $scope.editor = {
    		

            // ng-click Callbacks
            //
            // Open the FileOpenDialog and let the user select a new file for open
    		//
    		fileOpen: function(){
    		    var modalInstance = $modal.open({
    		      templateUrl:'assets/templates/FileOpenController.html',
    		      controller: 'FileOpenController'
    		    });
    		    
    		    modalInstance.result.then(
    		        // [OK]
    		    	function (content) {
    		    	    $scope.editor.load(content);
	    		    }, 
	    		    // [Cancel]
	    		    function () {
	    		        
	    		    }
	    	   );
    		},

            // ng-click Callbacks
            //
            // Open the FileOpenDialog and let the user select a new file for open
            //
            about: function(){
                var modalInstance = $modal.open({
                    templateUrl:'assets/templates/AboutController.html',
                    controller: 'AboutController'
                });

                modalInstance.result.then(
                    // [OK]
                    function () {

                    },
                    // [Cancel]
                    function () {

                    }
                );
            },

            changeUserData: function() {
                // Obtenemos el listado de propiedades
                var target = $('#tableValues tr');
                var props = {};
                $.each(target, function() {
                    var key = $(this).find('td')[0].innerHTML;
                    var value = $(this).find('td input')[0].value;
                    props[key] = value;
                    console.log(key + value);
                });
                // Reasignamos el valor de las propiedades
                var stringJSON = JSON.stringify(props);
                $scope.editor.selection.attr.userData = props;
            }, 

            cancelUserData: function() {
                var content = angular.element('#tableValues tr');
                $.each(content, function() {
                    $(this).remove();
                });

                // Y añadimos los elementos de origen
                var toBody = angular.element('#tableValues');
                var userData = $scope.editor.selection.attr.userData;
                var html = "";
                $.each(userData, function(key,value) {
                    var aux = key=='type'?"true":"false";
                    html = html.concat(
                            "<tr>",
                            "<td>" + key + "</td>",
                            "<td><input class='form-control' type='text' value='" + value + "' ng-readonly='" + aux + "'></td>",
                            "</tr>"
                        );

                });
                toBody.append(html);
            },             //------------------------------------------------------------------------
    		
    		
    		// Configuration of the editor
    		//
    		// 
            canvas : {
                // callback if a DOM node from the palette is dropped inside the canvas
                //
                onDrop: function(droppedDomNode, x, y, shiftKey, ctrlKey){
                    var type = $(droppedDomNode).data("shape");
                    var flumeType = $(droppedDomNode).data("type");
                    var figure = eval("new "+type+"();");
                    setProperties(figure, flumeType);
                    // Añadimos las propiedades del objeto flume
                    figure.on("click", function(emitter, event) {
                        console.log("hola" + emitter.id + flumeType);
                    });
                    // CAmbiamos la politica de puertos
                    figure.getPorts().each(function(i,value) {
                        value.uninstallEditPolicy(new draw2d.policy.port.IntrusivePortsFeedbackPolicy());



                        value.installEditPolicy(new draw2d.policy.port.ConnectionPortPolicy());

                    });
                    // install a Connection create policy which matches to a "circuit like"
                    // connections
                    //
                    // create a command for the undo/redo support
                    var command = new draw2d.command.CommandAdd(this, figure, x, y);
                    this.getCommandStack().execute(command);
                }
            },
 
            // provide all figures to show in the left hand palette.
            // Used by the directrives/canvas.js
            palette: {
                    figures: [
                        {class:"draw2d.shape.node.Start", type:"AvroSource", name:"Avro Source"},
                        {class:"draw2d.shape.node.Start", type:"ExecSource", name:"Exec Source"},
                        {class:"draw2d.shape.node.Between", type:"MemoryChannel", name:"Memory Channel"},
                        {class:"draw2d.shape.node.Between", type:"KafkaChannel", name:"Kafka Channel"},
                        {class:"draw2d.shape.node.End", type:"HDFSSink", name:"HDFS Sink"},
                        {class:"draw2d.shape.node.End", type:"KafkaSink", name:"Kafka Sink"}
                    ]
            }
    };
}]);
