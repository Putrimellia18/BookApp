import { useState } from "react";
import { ActivityIndicator, StyleSheet, FlatList, TextInput, Button } from "react-native";

import { Text, View } from "../components/Themed";
import { gql, useQuery, useLazyQuery } from "@apollo/client";
import BookItem from "../components/BookItem";
import { SafeAreaView } from "react-native-safe-area-context";

const query = gql`
  query SearchBooks($q: String) {
    googleBooksSearch(q: $q, country: "US") {
      items {
        id
        volumeInfo {
          authors
          averageRating
          description
          imageLinks {
            thumbnail
          }
          title
          subtitle
          industryIdentifiers {
            identifier
            type
          }
        }
      }
    }
    openLibrarySearch(q: $q) {
      docs {
        author_name
        title
        cover_edition_key
        isbn
      }
    }
  }
`;

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState<"googleBooksSearch" | "openLibrarySearch">("googleBooksSearch");
  const [runQuery, { data, loading, error }] = useLazyQuery(query);
  const parseBook = (item: any) => {
    if (provider === "googleBooksSearch") {
      return {
        title: item.volumeInfo.title,
        image: item.volumeInfo.imageLinks?.thumbnail,
        authors: item.volumeInfo.authors,
        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
      };
    } else {
      return {
        title: item.title,
        authors: item.author_name,
        image: `https://covers.openlibrary.org/b/olid/${item.cover_edition_key}-M.jpg`,
        isbn: item.isbn?.[0],
      };
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search..." style={styles.input} />
        <Button title="Search" onPress={() => runQuery({ variables: { q: search } })} />
      </View>

      <View style={styles.tabs}>
        <Text style={provider === "googleBooksSearch" ? { fontWeight: "bold", color: "royalblue" } : {}} onPress={() => setProvider("googleBooksSearch")}>
          Google Books
        </Text>
        <Text style={provider === "openLibrarySearch" ? { fontWeight: "bold", color: "royalblue" } : {}} onPress={() => setProvider("openLibrarySearch")}>
          Open Library
        </Text>
      </View>

      {loading && <ActivityIndicator />}
      {error && (
        <View>
          <Text>Error Fetching Books</Text>
          <Text>{error.message}</Text>
        </View>
      )}
      <FlatList data={provider === "googleBooksSearch" ? data?.googleBooksSearch?.items : data?.openLibrarySearch?.docs || []} renderItem={({ item }) => <BookItem book={parseBook(item)} />} showsVerticalScrollIndicator={false} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gainsboro",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 50,
  },
});
