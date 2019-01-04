import json

from flask import current_app

def add_to_index(payload):
    if not current_app.elasticsearch:
        return
    
    current_app.elasticsearch.index(index='default', doc_type='default', id=payload['asset_id'],
                                    body=json.dumps(payload))

def remove_from_index(id):
    if not current_app.elasticsearch:
        return
    current_app.elasticsearch.delete(index='default', id=id)

def query_index(user_query):
    search_object = {"query": {
                       "multi_match": {
                            "fields": ["asset_name^3", "asset_type"],
                            "fuzziness": "auto",
                            "query": user_query
                            }
                        }
                    }   

    if not current_app.elasticsearch:
        return [], 0
    search = current_app.elasticsearch.search(
        index='default', doc_type='default',
        body=json.dumps(search_object)
    )

    print(search)

    ids = [int(hit['_id']) for hit in search['hits']['hits']]
    return ids, search['hits']['total']