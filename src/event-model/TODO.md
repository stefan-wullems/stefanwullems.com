# Event Modelling

## Planning

### Phase 1: Flow Modelling

MVP:
- [] Views, commands, events and readmodels rendered into swimlanes
- [] Organized into slices: state transitions and state views.

- State view: takes in events, defines readmodel, and view.

Nice to have:
- [] Graph arrows between different components
- [] Events are separated into their own swimlanes by aggregate
- [] Commands are separated into their own swimlanes by context

### Phase 2: Schema definition

MVP:
- [] Add fields to commands, read models and events.

Nice to have:
- [] Check if the necessary data is present in the preceding steps to ensure the data is complete§

### Phase 3: Test definition

MVP:
- [] Given when then clauses added to slices

### Phase 4: Documentation

- We can organize slices into subchapters, chapters and the whole project is the book
- We can create tickets for each slice in trello or jira
- Changes in the system can also be organized by slice, this is just so fucking convenient.
- It can be directly linked to the ticketing system so that we can see on the overview what's implemented and what still needs to be done

## Notes

 The difficult thing between composing slices is that state view and state transition slices share a view. I think then the organizing principle is a view. No that doesnt' work always because sometimes it spans views. Yeah no it makes sense, a view defines readmodels and interactions. We organize slices around views. But there are multiple places where you could trigger a slice, so slices are related to views, but not. You know what, screw the concept of a slice encapsulating events and views too, we're just going to say that commands and readmodels are slices. We can stil reduce coupling by saying that each command owns its events. That means we might have some redundancy sometimes. But it's ok, I think it's still kind of clear. It at least avoids ChangeSomething events that get used in all cases but makes the events more business.

So in other words, a slice is a command that can output certain events (that it owns) using given when then scenarios (that can be based on events that are produced by other commands.)

I don't think we need the concept of slice, I think we can just have readmodels and commands, so a readmodel is a reusable piece that can listen to certain events and a command is a reusable piece that can output certain events.

If we make the tight mapping between command and events, and if we define the given when then cases clearly, we can make a diagram to show what all the possible histories of a given event are, or what histories need to be there before a command can be called.

---

Maybe someday one can make a framework out of this that creates entire applications.

---

The more events used in a readmodel, the more coupling we are creating between slices. This is a reason to create small, use case specific readmodels when possible.

---

There is a layer inbetween the ui and the command handler that can enrich the command with additional information required to do business logic. The command handler shouldn't fetch anything at least.

## Business rules

### Commands

- Commands should provide all information for the business logic. So no additional information fetching in the command handler.
- Command handler should be pure.
- ❓How does this work with aggregates? If we don't depend on the event store?
