// Starter diagrams for the UML editor, one per supported UML diagram type.
// All of them are Mermaid syntax and render entirely in the browser.

export interface UmlSample {
    id: string;
    label: string;
    source: string;
}

export const UML_SAMPLES: UmlSample[] = [
    {
        id: "class",
        label: "Class diagram",
        source: `classDiagram
    direction LR
    class Customer {
        +String name
        +String email
    }
    class Order {
        +String id
        +Date placedAt
        +total() Money
        +place() void
    }
    class OrderLine {
        +int quantity
        +Money unitPrice
        +subtotal() Money
    }
    class Payment {
        <<interface>>
        +authorize(amount: Money) bool
    }
    class CardPayment
    class PayPalPayment

    Customer "1" --> "*" Order : places
    Order "1" *-- "1..*" OrderLine : contains
    Order --> Payment : paid by
    Payment <|.. CardPayment
    Payment <|.. PayPalPayment
`,
    },
    {
        id: "sequence",
        label: "Sequence diagram",
        source: `sequenceDiagram
    autonumber
    actor User
    participant App as Web App
    participant API
    participant DB as Database

    User->>App: Submit login form
    App->>API: POST /login
    API->>DB: Find user by email
    DB-->>API: User record
    alt Password matches
        API-->>App: 200 OK + session token
        App-->>User: Show dashboard
    else Wrong password
        API-->>App: 401 Unauthorized
        App-->>User: Show error message
    end
`,
    },
    {
        id: "activity",
        label: "Activity diagram",
        source: `flowchart TD
    start([Start]) --> cart[Review cart]
    cart --> stock{All items in stock?}
    stock -- No --> notify[Notify customer]
    notify --> stop([End])
    stock -- Yes --> pay[Take payment]
    pay --> approved{Payment approved?}
    approved -- No --> retry[Ask for another card]
    retry --> pay
    approved -- Yes --> ship[Ship order]
    ship --> stop
`,
    },
    {
        id: "state",
        label: "State diagram",
        source: `stateDiagram-v2
    [*] --> Draft
    Draft --> Review : submit
    Review --> Draft : request changes
    Review --> Approved : approve
    Approved --> Published : publish
    Published --> Archived : archive
    Archived --> [*]

    state Review {
        [*] --> Pending
        Pending --> InReview : reviewer assigned
        InReview --> [*]
    }
`,
    },
    {
        id: "usecase",
        label: "Use case diagram",
        source: `usecase-beta
    direction LR
    actor Customer
    actor Admin
    systemBoundary shop[Online Shop]
        browse(Browse products)
        checkout(Check out)
        pay(Pay by card)
        manage(Manage catalog)
    end
    Customer --> browse
    Customer --> checkout
    checkout ..>:include pay
    Admin --> manage
`,
    },
];

export const DEFAULT_UML_SOURCE = UML_SAMPLES[0].source;
