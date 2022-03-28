const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull, GraphQLID } = require('graphql');
const { authors, books } = require('./data.js');

const app = express();

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: new GraphQLNonNull( GraphQLInt ) },
        name: { type: new GraphQLNonNull( GraphQLString ) },
        authorId: { type: new GraphQLNonNull( GraphQLInt ) },
        author: {
            type: AuthorType,
            resolve: ( book ) => {
                return authors.find( author => author.id === book.authorId );
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents a author of a book',
    fields: () => ({
        id: { type: new GraphQLNonNull( GraphQLInt ) },
        name: { type: new GraphQLNonNull( GraphQLString ) },
        books: {
            type: new GraphQLList( BookType ),
            resolve: ( author ) => {
                return books.filter( book => book.authorId === author.id);
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single book',
            args: {
                id: { type: new GraphQLNonNull( GraphQLInt ) }
            },
            resolve: ( parent, args ) => books.find( book => book.id === args.id ) // If we had a DB could query a book by id directly from it
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of all books',
            resolve: () => books // If we had a DB could query a list of books directly from it
        },
        author: {
            type: AuthorType,
            description: 'A single author',
            args: {
                id: { type: new GraphQLNonNull( GraphQLInt ) }
            },
            resolve: ( parent, args ) => authors.find( author => author.id === args.id ) // If we had a DB could query a author by id directly from it
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all authors',
            resolve: () => authors // If we had a DB could query a list of authors directly from it
        }
    })
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: new GraphQLNonNull( GraphQLString ) },
                authorId: { type: new GraphQLNonNull( GraphQLInt ) }
            },
            resolve: ( parent, args ) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                };
                books.push( book );
                return book;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: new GraphQLNonNull( GraphQLString ) },
            },
            resolve: ( parent, args ) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name
                };
                authors.push( author );
                return author;
            }
        }
    })
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', expressGraphQL({
    graphiql: true,
    schema: schema
})); 
app.listen(5000, () => console.log('Server running'));