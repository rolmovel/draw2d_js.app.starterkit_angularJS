/**
 * @class draw2d.policy.port.IntrusivePortsFeedbackPolicy
 * 
 * A draw2d.policy.SelectionFeedbackPolicy that is sensitive to the canvas selection. Subclasses will typically 
 * decorate the {@link draw2d.Figure figure} with things like selection handles and/or focus feedback.
 * <br>
 * If you want to change the handle visibility for a figure, then you should use SelectionFeedbackPolicy to do that.
 * 
 * @author Andreas Herz
 * @extends draw2d.policy.figure.DragDropEditPolicy
 */
draw2d.policy.port.ConnectionPortPolicy = draw2d.policy.port.PortFeedbackPolicy.extend({

    NAME : "draw2d.policy.port.ConnectionPortPolicy",
    
    /**
     * @constructor 
     */
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
        this.connectionLine = null;
        this.tweenable = null;
    },
    
    /**
     * @method
     * Called by the framework if the related shape has init a drag&drop
     * operation
     * 
     * @param {draw2d.Canvas} canvas The host canvas
     * @param {draw2d.Figure} figure The related figure
     * @param {Number} x the x-coordinate of the mouse up event
     * @param {Number} y the y-coordinate of the mouse up event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     */
    onDragStart: function(canvas, figure, x, y, shiftKey, ctrlKey)
    {
        var start = 0;
        var allPorts = canvas.getAllPorts().clone();
        allPorts.each(function(i, element){
            if(typeof element.__beforeInflate ==="undefined") {
                element.__beforeInflate = element.getWidth();
            }
            start = element.__beforeInflate;
        });


        allPorts.grep(function(p){
            // Si es una fuente solo puede unirse a un Channel
            // Si es un channel solo puede unirse a un sink
            var originType = figure.parent.userData.type;
            var destinationType = p.parent.userData.type;

            // Si es funte solo me quedo con los channel
            if (/.*Source/.test(originType))
                return /.*Channel/.test(destinationType);
            else if(/.*Channel/.test(originType))
                return /.*Sink/.test(destinationType);
            else 
                return false;
       });

        // animate the resize of the ports
        //
        allPorts.grep(function(p){
            return (p.NAME != figure.NAME && p.parent!==figure.parent) || (p instanceof draw2d.HybridPort) || (figure instanceof draw2d.HybridPort);
        });
        this.tweenable = new Tweenable();
        this.tweenable.tween({
          from:     { 'size': start/2 },
          to:       { 'size': start   },
          duration: 200,
          easing : "easeOutSine",
          step: function(params) {
              allPorts.each(function(i, element){
                  // IMPORTANT shortcut to avoid rendering errors!!
                  // performance shortcut to avoid a lot of events and recalculate/routing of all related connections
                  // for each setDimension call. Additional the connection is following a port during Drag&Drop operation
                  element.shape.attr({rx : params.size, ry :params.size});
                  element.width = element.height = params.size*2;
                  //element.setDimension(params.size, params.size);
              });
          }
        });
        
        this.connectionLine = new draw2d.shape.basic.Line();
        this.connectionLine.setCanvas(canvas);
        this.connectionLine.getShapeElement();
        this.connectionLine.setDashArray("- ");
        this.connectionLine.setColor("#30c48a");
       
        this.onDrag(canvas, figure);

        return true;
    },
    
    
    /**
     * @method
     * Called by the framework during drag a figure.
     * 
     * @param {draw2d.Canvas} canvas The host canvas
     * @param {draw2d.Figure} figure The related figure
     * @template
     */
    onDrag: function(canvas, figure)
    {
        var x1 = figure.ox+figure.getParent().getAbsoluteX();
        var y1 = figure.oy+figure.getParent().getAbsoluteY();
        
        this.connectionLine.setStartPoint(x1,y1);
        this.connectionLine.setEndPoint(figure.getAbsoluteX(),figure.getAbsoluteY());
    },
    
    /**
     * @method
     * Called by the framework if the drag drop operation ends.
     * 
     * @param {draw2d.Canvas} canvas The host canvas
     * @param {draw2d.Figure} figure The related figure
     * @template
     */
    onDragEnd: function(canvas, figure, x, y, shiftKey, ctrlKey)
    {
        if(this.tweenable) {
            this.tweenable.stop(true);
            this.tweenable.dispose();
            this.tweenable = null;
        }
        canvas.getAllPorts().each(function(i, element){
            // IMPORTANT shortcut to avoid rendering errors!!
            // performance shortcut to avoid a lot of events and recalculate/routing of all related connections
            // for each setDimension call. Additional the connection is following a port during Drag&Drop operation
            element.shape.attr({rx : element.__beforeInflate/2, ry :element.__beforeInflate/2});
            element.width = element.height = element.__beforeInflate;
            delete element.__beforeInflate;
            //element.setDimension(element.__beforeInflate, element.__beforeInflate);
        });
        this.connectionLine.setCanvas(null);
        this.connectionLine = null;
    },
    
    onHoverEnter: function(canvas, draggedFigure, hoverFiger)
    {
        this.connectionLine.setGlow(true);
        hoverFiger.setGlow(true);
    },
    
    onHoverLeave: function(canvas, draggedFigure, hoverFiger)
    {
        hoverFiger.setGlow(false);
        if(this.connectionLine===null){
            debugger;
        }
        this.connectionLine.setGlow(false);
    }

        
});

draw2d.policy.canvas.ConnectionInterceptorPolicy = draw2d.policy.canvas.DropInterceptorPolicy.extend({

    NAME : "draw2d.policy.canvas.ConnectionInterceptorPolicy",
    
    /**
     * @constructor 
     * 
     */
    init: function(attr, setter, getter)
    {
        this._super(attr, setter, getter);
    },
    

    /**
     * @method
     * Called if the user want connect a port with any kind draw2d.Figure.<br>
     * Return a non <b>null</b> value if the interceptor accept the connect event.<br>
     * <br>
     * It is possible to delegate the drop event to another figure if the policy
     * returns another figure. This is usefull if a figure want to accept a port 
     * drop event and delegates this drop event to another port.<br>
     * 
     * 
     * @param {draw2d.Figure} connectInquirer the figure who wants connect
     * @param {draw2d.Figure} connectIntent the potential connect target
     *
     * @return {draw2d.Figure} the calculated connect intent or <b>null</b> if the interceptor uses the veto right
     */
    delegateTarget: function(connectInquirer, connectIntent)
    {
        // a composite accept any kind of figures exceptional ports
        //
        if(!(connectInquirer instanceof draw2d.Port) && connectIntent instanceof draw2d.shape.composite.StrongComposite){
            return connectIntent;
        }
        
        // Ports accepts only Ports as DropTarget
        //
        if(!(connectIntent instanceof draw2d.Port) || !(connectInquirer instanceof draw2d.Port)){
            return null;
        }
 
        // consider the max possible connections for this port
        //
        if(connectIntent.getConnections().getSize() >= connectIntent.getMaxFanOut()){
            return null;
        }

        // It is not allowed to connect two output ports
        if (connectInquirer instanceof draw2d.OutputPort && connectIntent instanceof draw2d.OutputPort) {
            return null;
        }
        
        // It is not allowed to connect two input ports
        if (connectInquirer instanceof draw2d.InputPort && connectIntent instanceof draw2d.InputPort) {
            return null;
        }

        // Los puertos ti
        // Si es funte solo me quedo con los channel
        var originType = connectInquirer.parent.userData.type;
        var destinationType = connectIntent.parent.userData.type;
        if (/.*Source/.test(originType))
            return (/.*Channel/.test(destinationType)?connectIntent:null);
        else if(/.*Channel/.test(originType))
            return (/.*Sink/.test(destinationType)?connectIntent:null);
        else 
            return null;

        // It is not possible to create a loop back connection at the moment.
        // Reason: no connection router implemented for this case
        if((connectInquirer instanceof draw2d.Port) && (connectIntent instanceof draw2d.Port)){
            if(connectInquirer.getParent() === connectIntent.getParent()){
                return null;
             }
        }

        // redirect the dragEnter handling to the hybrid port
        //
        if((connectInquirer instanceof draw2d.Port) && (connectIntent instanceof draw2d.shape.node.Hub)) {
            return connectIntent.getHybridPort(0);
        }

        // return the connectTarget determined by the framework or delegate it to another
        // figure.
        return connectIntent;
    }
    
});
