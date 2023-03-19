interface ErrorModel {
    readonly id: string;
    readonly name: string;
    readonly type: 'error' | 'warning';
    readonly severity: 'high' | 'low' | 'medium';
    readonly message: string;
}

const ErrorDictionary = {
    CONTENT_NOT_FOUNDED_IN_STRUCTURE: {
        id: '1',
        message: 'Content not founded.',
        severity: 'high',
        name: 'CONTENT_NOT_FOUNDED_IN_STRUCTURE',
        type: 'error',
    },
    TEMPLATE_NOT_FOUND: {
        id: '2',
        message: 'Template not founded.',
        severity: 'high',
        name: 'TEMPLATE_NOT_FOUND',
        type: 'error',
    },
    XOR_CONTENT: {
        id: '3',
        message: 'Is spected only one occurrence when used xor condition.',
        severity: 'high',
        name: 'XOR_CONTENT',
        type: 'error',
    },
    CONTENT_WITH_WHITESPACE: {
        id: '4',
        message: 'Content with whitespace.',
        severity: 'medium',
        name: 'CONTENT_WITH_WHITESPACE',
        type: 'error',
    },
    WRONG_DESCRIPTION: {
        id: '5',
        message: 'Description is different from the structure.',
        severity: 'medium',
        name: 'WRONG_DESCRIPTION',
        type: 'error',
    },
    CONTENT_WITHOUT_CHILDREN: {
        id: '6',
        message: 'Item has no child/children when it was expected to have.',
        severity: 'high',
        name: 'CONTENT_WITHOUT_CHILDREN',
        type: 'error',
    },
    CONTENT_WITH_CHILDREN: {
        id: '7',
        message: 'Item has child/children when it was expected not to have.',
        severity: 'high',
        name: 'CONTENT_WITH_CHILDREN',
        type: 'error',
    },
    CONTENT_ISNOT_VISIBLE: {
        id: '8',
        message: 'Item is invisible when it was expected to be visible.',
        severity: 'medium',
        name: 'CONTENT_ISNOT_VISIBLE',
        type: 'error',
    },
    CONTENT_IS_VISIBLE: {
        id: '9',
        message: 'Item is visible when it was expected to be invisible.',
        severity: 'high',
        name: 'CONTENT_IS_VISIBLE',
        type: 'error',
    },
    CONTENT_TYPE_IS_DIFFERENT: {
        id: '10',
        message: 'Item type is different from the structure.',
        severity: 'high',
        name: 'CONTENT_TYPE_IS_DIFFERENT',
        type: 'error',
    },
};

export default ErrorDictionary as Record<
    keyof typeof ErrorDictionary,
    ErrorModel
>;
